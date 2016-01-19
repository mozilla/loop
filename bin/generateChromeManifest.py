#!/usr/bin/python

##
# This script is designed to generate the chrome.manifest for the add-on in
# the propert format, taking into account the locales present in the repo.
##

from __future__ import print_function

import argparse
import io
import os
import re

# defaults
DEF_L10N_SRC = os.path.join("locale")
DEF_INPUT_FILE_NAME = os.path.join("add-on", os.extsep.join(["jar", "mn"]))
DEF_OUTPUT_FILE_NAME = os.path.join("built", "add-on", os.extsep.join(["chrome", "manifest"]))


def main(l10n_src, input_file_name, output_file_name):
    print("Using l10n tree from", l10n_src)

    locale_dirs = sorted(os.listdir(l10n_src))

    input_file = io.open(input_file_name, "r")

    jar_mn = input_file.read()

    # Drop any line that doesn't begin with %.
    manifest_output = "\n".join(line for line in jar_mn.split("\n") if (re.match("^%", line)))

    # Drop the "% " from the start of lines.
    manifest_output = re.sub(
        "^% (.*$)",
        "\\1",
        manifest_output, 0, re.M)

    # Replace remaining % with "chrome/".
    manifest_output = re.sub(
        "%",
        "chrome/",
        manifest_output, 0)

    localeLines = ["locale loop {0} chrome/locale/{0}/".format(x) for x in locale_dirs]

    manifest_output = re.sub(
        "(locale loop .*\n)",
        "\n".join(localeLines) + "\n",
        manifest_output)

    # For the loop-locale-fallback we need to adjust the path for inclusion.
    # Mozilla-central actually duplicates file, the add-on by itself doesn't.
    manifest_output = re.sub(
        "(chrome/content/locale-fallback/en-US/)",
        "chrome/locale/en-US/",
        manifest_output)

    output_file = io.open(output_file_name, "w")

    output_file.write(manifest_output)

    input_file.close()
    output_file.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Loop Stand-alone Client localization update script")
    parser.add_argument("--src",
                        default=DEF_L10N_SRC,
                        metavar="path",
                        help="Source path for l10n resources. Default = " + DEF_L10N_SRC)
    parser.add_argument("--input-file",
                        default=DEF_INPUT_FILE_NAME,
                        metavar="name",
                        help="The source jar file used to generate the manifest. Default = " + DEF_INPUT_FILE_NAME)
    parser.add_argument("--output-file",
                        default=DEF_OUTPUT_FILE_NAME,
                        metavar="name",
                        help="File to be updated with the locales list. Default = " + DEF_OUTPUT_FILE_NAME)
    args = parser.parse_args()
    main(args.src, args.input_file, args.output_file)
