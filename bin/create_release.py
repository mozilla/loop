#!.venv/bin/python

import argparse
import bugsy
import os
import subprocess
import sys
from git import Repo

DEFAULTS = {
    "dev": {
        "bugzilla": "bugzilla-dev.allizom.org",
        "bugzillaRest": "https://bugzilla-dev.allizom.org/rest",
        "product": "Loop",
    },
    "prod": {
        "bugzilla": "bugzilla.mozilla.org",
        "bugzillaRest": "https://bugzilla.mozilla.org/rest",
        "product": "Hello (Loop)"
    }
}

oldApiKey = None


def runProcess(cmd, cwd, errorMessage):
    print "runProcess ", cmd
    p = subprocess.Popen(cmd, cwd=cwd)

    result = p.wait()

    if result:
        print >> sys.stderr, errorMessage % result
        sys.exit(1)


def checkTag(repo, version):
    realTag = "v" + version

    try:
        result = repo.tags[realTag]
    except:
        print >> sys.stderr, "Could not find tag %s for version %s" % (realTag, version)
        return None

    print "Tag %s found..." % realTag
    return result


def loginToBugzilla(useSystem, username, apikey):
    bugzillaUrl = DEFAULTS[useSystem]["bugzillaRest"]

    print "Logging into bugzilla %s..." % bugzillaUrl

    bugzilla = bugsy.Bugsy(username=username, api_key=apikey, bugzilla_url=bugzillaUrl)

    print "Done..."

    return bugzilla


def getInput(message):
    print message
    result = raw_input("(y/n): ").rstrip("\r\n")

    while result != "y" and result != "n":
        print "Please answer 'y' or 'n'!"
        result = raw_input("(y/n): ").rstrip("\r\n")

    return result


def releaseStandalone(bugzilla, repo, useSystem, version, username):
    print "Creating a bug for standalone"

    print "Please enter the previous release version:"
    previousRelease = raw_input().rstrip("\r\n")

    print "Please enter any requests for the deployers, e.g.:"
    print "We'd like this to be deployed to production this week please, assuming no issues found."
    notes = raw_input("--> ").rstrip("\r\n")

    checkTag(repo, previousRelease)

    tag = checkTag(repo, version)

    bug = bugsy.Bug()
    bug.summary = "Please deploy loop standalone %s to STAGE" % version
    bug.product = DEFAULTS[useSystem]["product"]
    bug.component = "Client"
    bug.platform = "All"
    bug.add_comment("""------------------
RELEASE NOTES
------------------
https://github.com/mozilla/loop/blob/v%s/CHANGELOG.md

COMPARISONS
https://github.com/mozilla/loop/compare/v%s...v%s

TAGS
https://github.com/mozilla/loop/releases/tag/v%s
https://github.com/mozilla/loop/commit/%s

Notes: %s
""" % (version, previousRelease, version, version, tag.commit.hexsha, notes))

    bug._bug["url"] = "https://github.com/mozilla/loop/releases/tag/v%s" % version
    bug._bug["cc"] = ["standard8@mozilla.com"]

    bugzilla.put(bug)

    print "Bug id is: %s" % bug.id
    print "Bug url: https://%s/show_bug.cgi?id=%s" % (DEFAULTS[useSystem]["bugzilla"], bug.id)


def releaseMozillaCentral(bugzilla, repoDir, useSystem, mcRepoPath, version,
                          username, ircNick):
    print "Exporting to m-c"

    if not mcRepoPath:
        print >> sys.stderr, "mozilla-central repository not supplied!"
        sys.exit(1)

    if not ircNick:
        print >> sys.stderr, "irc nick not supplied!"
        sys.exit(1)

    pushToTry = getInput("Push result to try (assumes git-cinnibar)?") == "y"

    os.environ["EXPORT_MC_LOCATION"] = mcRepoPath

    mcRepo = Repo(os.path.realpath(mcRepoPath))

    # XXX Drop this, prompt user
    if mcRepo.active_branch.name != "default":
        print "Checking out default"
        mcRepo.heads.default.checkout()

    print "Creating new branch for version %s" % version
    mcRepo.create_head(version)

    mcRepo.heads[version].checkout()

    print "Doing a git export..."

    runProcess(['make', 'clean'], repoDir, "Failed to make clean: %s")

    runProcess(['make', 'export_mc'], repoDir, "Failed to make export_mc: %s")

    # Can't find a way to do this via gitPython APIs, so do it manually.
    mcRepo.git.execute(["git", "add", "browser/extensions/loop"])

    print "Building..."

    runProcess(['./mach', 'build'], mcRepoPath, "Failed to build in mc repo: %s")

    runProcess(['./browser/extensions/loop/run-all-loop-tests.sh'], mcRepoPath,
               "Tests failed! %s \nTree left in unclean state.")

    print "Filing bug..."

    baseVersionText = "Land version %s of the Loop system add-on in mozilla-central" % version

    bug = bugsy.Bug()
    bug.summary = baseVersionText
    bug.add_comment("Changelog: https://github.com/mozilla/loop/blob/release/CHANGELOG.md")
    bug.assigned_to = username
    bug.product = DEFAULTS[useSystem]["product"]
    bug.component = "Client"
    bug.platform = "All"
    bug._bug["url"] = "https://github.com/mozilla/loop/releases/tag/v%s" % version
    bug._bug["whiteboard"] = "[btpp-fix-now]"
    bug._bug["priority"] = "P1"
    bug._bug["cf_rank"] = 1

    bugzilla.put(bug)

    print "Bug id is: %s" % bug.id
    print "Bug url: https://%s/show_bug.cgi?id=%s" % (DEFAULTS[useSystem]["bugzilla"], bug.id)

    print "Attaching patch to bug"

    index = mcRepo.index

    index.commit("Bug %s - %s, rs=%s for already reviewed code." % (bug.id, baseVersionText, ircNick))

    bugzillaHost = DEFAULTS[useSystem]["bugzilla"]

    runProcess(["git-bz", "attach", "-n", bugzillaHost + ":" + str(bug.id), "HEAD"],
               mcRepoPath, "Failed to attach file: %s")

    if pushToTry:
        print "Pushing to try"
        runProcess(["git", "commit", "-m",
                    "try: -b do -p linux,linux64,macosx64,win32,win64 -u xpcshell," +
                    "marionette,marionette-e10s,mochitest-bc,mochitest-dt," +
                    "mochitest-e10s-bc,mochitest-e10s-devtools-chrome -t none",
                    "--allow-empty"])

        runProcess(["git", "push", "try"])

    print "Done, please:"
    print "- Check the diffs in the bug"
    print "- Add r+ as the review flag"
    print "- Merge branch %s and push to fx-team" % version


def switchApiKey(repo, useSystem, newKey):
    global oldApiKey
    config = repo.config_writer(config_level="global")

    oldApiKey = config.get_value("bz", "apikey")

    bugzillaHost = DEFAULTS[useSystem]["bugzilla"]

    config.set_value("bz-tracker " + "\"" + bugzillaHost + "\"", "https", "true")

    config.set_value("bz", "apikey", newKey)


def resetApiKey(repo):
    global oldApiKey

    if oldApiKey:
        config = repo.config_writer(config_level="global")

        config.set_value("bz", "apikey", oldApiKey)


def main(useProd, username, apikey, releaseVersion, mcRepoPath, ircNick):

    useSystem = "dev"
    if useProd:
        useSystem = "prod"

    repoDir = os.path.dirname(os.path.realpath(os.path.join(__file__, "..")))

    repo = Repo(repoDir)

    switchApiKey(repo, useSystem, apikey)

    try:
        if not checkTag(repo, releaseVersion):
            sys.exit(1)

        bugzilla = loginToBugzilla(useSystem, username, apikey)

        if getInput("Release standalone?") == "y":
            releaseStandalone(bugzilla, repo, useSystem, releaseVersion, username)

        if getInput("Release to mozilla-central") == "y":
            releaseMozillaCentral(bugzilla, repoDir, useSystem, mcRepoPath, releaseVersion,
                                  username, ircNick)

        resetApiKey(repo)

    except:
        resetApiKey(repo)
        raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Loop script for creating releases")
    parser.add_argument("--prod",
                        default=False,
                        action="store_true",
                        help="Use production bugzilla. Default: use developer server")
    parser.add_argument("--username",
                        metavar="example@invalid.com",
                        help="Bugzilla username.",
                        required=True)
    parser.add_argument("--apikey",
                        metavar="123456abcd",
                        help="Bugzilla API key.",
                        required=True)
    parser.add_argument("--rel-version",
                        metavar="1.2.1",
                        help="The version number to release, e.g. '1.2.1'.",
                        required=True)
    parser.add_argument("--mozilla-central-repo",
                        metavar="../gecko-dev",
                        help="A gecko directory reference to mozilla-central")
    parser.add_argument("--reviewer-irc-nick",
                        metavar="coolperson",
                        help="IRC nick to use in commit messages")
    args = parser.parse_args()

    main(args.prod, args.username, args.apikey, args.rel_version,
         args.mozilla_central_repo, args.reviewer_irc_nick)
