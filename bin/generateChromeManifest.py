#!/usr/bin/python

##
# This script is designed to generate the chrome.manifest for the add-on in
# the propert format, taking into account the locales present in the repo.
##

import argparse
import io
import os
import re

# defaults
DEF_INPUT_FILE_NAME = os.path.join("add-on", os.extsep.join(["jar", "mn"]))
DEF_OUTPUT_FILE_NAME = os.path.join("built", "add-on", os.extsep.join(["chrome", "manifest"]))


def main(input_file_name, output_file_name):
    input_file = io.open(input_file_name, "r", encoding="UTF-8")

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

    # For the loop-locale-fallback we need to adjust the path for inclusion.
    # Mozilla-central actually duplicates file, the add-on by itself doesn't.
    manifest_output = re.sub(
        "(chrome/content/locale-fallback/en-US/)",
        "chrome/locale/en-US/",
        manifest_output)

    # Sometimes we can end up without a new line on the end of the file, so
    # add one at this stage.
    if manifest_output[len(manifest_output) - 1] != "\n":
        manifest_output += "\n"

    # Now add a reference to the sub-manifest.
    manifest_output += "manifest chrome/locale/chrome.manifest\n"

    output_file = io.open(output_file_name, "w", encoding="UTF-8")

    output_file.write(manifest_output)

    input_file.close()
    output_file.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Loop chrome manifest generation script")
    parser.add_argument("--input-file",
                        default=DEF_INPUT_FILE_NAME,
                        metavar="name",
                        help="The source jar file used to generate the manifest. Default = " + DEF_INPUT_FILE_NAME)
    parser.add_argument("--output-file",
                        default=DEF_OUTPUT_FILE_NAME,
                        metavar="name",
                        help="File to be updated with the locales list. Default = " + DEF_OUTPUT_FILE_NAME)
    args = parser.parse_args()
    main(args.input_file, args.output_file)
