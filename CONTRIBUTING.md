Branches
========

The `master` branch contains the latest code that is not necessarily released.
At any time, the code on the `master` branch should be suitable for releasing.

Developer Workflow
==================

Creating a Pull Request
-----------------------

When you start work on a patch, make sure you're assigned to the bug. If you
don't have privileges you can request to be assigned by commenting on the bug or
asking in [irc](https://wiki.mozilla.org/Loop#Communication_Channels).

* When working on a patch it should be in a fork of the main repository.
  * It is advisable to use a separate well named branch for each patch.
  * Keep the branch/patch rebased on the latest `master` (especially before making
a pull request).
* Whilst working on your patch, make sure it passes `make test`, especially before
creating a pull request.
* Once you've finished a bug, commit the patch with a meaningful commit message
which describes why it is being changed, for example:
  * `Bug 123456 – Loop's RoomList view requires user profile data passed in when
it doesn't need to.`
* If you have multiple commits you should squash them down into one before
creating a pull request, unless there's a reason for separating them, for example:
  * With commits as one patch the patch would be a significant size and make it
hard for review.
  * When it makes sense to separate commits logically, e.g. “Implement a feature
change”, “Remove code associated with previous version of feature”.
* Push the branch to your fork of the github repo:
  * `git push origin bug-123456-fix-roomlist`
* Go to your repository in github, and create a pull request to the `master`
branch of the main repository (there should be an option displayed by github to
create this easily).
* Once you have created the pull request, tests will automatically be run and
should only take a few minutes.
  * It is useful to make sure the tests pass (are green) before requesting review,
otherwise your patch will be rejected.
* [Autolander](#autolander-bot) will automatically attach the pull request to the bug assuming the
pull request title is formatted correctly.
* Reviewers should be suggested, there is a suggested list of reviewers to pick from
if you don't know who to ask.
* If a pull request changes the UI then you should also attach screenshots or short
videos to the bug and request ui-review on those from :sevaan and :pau

Review
------

* If you didn't get review granted, or have comments to address, then edit the
files. If there's significant changes, it helps to address the comments in a
separate commit, to make the follow-up review easier.
* Once you have been granted review, please add `r=<name>` onto the end of the
commit message and rebase it against latest `master` so that it is ready to land.
* If there's no comments that need addressing, once you've added the annotation
then you can add checkin-needed onto the bug and someone will land it for you if
it hasn't been already.

Landing
-------

If you don't have permissions to the main repository, then you can ignore this section.

* Before a pull request can be landed it should:
  * Pass all automated tests
  * Have been reviewed
  * Have an appropriate commit structure
  * Each commit should have an appropriate message, e.g.
    * `Bug 123456 – Loop's RoomList view requires user profile data passed in when
it doesn't need to. r=Standard8`
    * If the PR is being merged with a merge commit due to limitations of branches,
      then the merge commit should have the `r=Standard8` included in it.
* If possible, a pull request should be landed without a merge commit. To do this:
  * the branch should be rebased on top of latest master
  * master should then be merged with the branch via fast-forward only:
    * `git merge --ff master`
  * If it was successful, push the result

Autolander (bot)
----------------

Autolander is a bot which integrates github and bugzilla workflows.

Features available:
  - Automatic pull request to bugzilla attachment linking.
  - Automatic landing with a R+ from a suggested reviewer and the autoland keyword.
  - Comments in the bug with the landed commit, and marks the bug as fixed.
  - Validates pull request title and commit message formats.
  - [Autolander on Github](https://github.com/mozilla/autolander)
