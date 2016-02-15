#!/usr/bin/python

##
# This script is designed to generate the chrome.manifest for the add-on in
# the propert format, taking into account the locales present in the repo.
##

import argparse
import io
import os
import localeUtils

# defaults
DEF_L10N_SRC = os.path.join("locale")
DEF_OUTPUT_FILE_NAME = os.path.join("built", "add-on", "chrome", "locale",
                                    os.extsep.join(["chrome", "manifest"]))


def main(l10n_src, output_file_name):
    locale_list = localeUtils.getLocalesList(l10n_src)

    localeLines = ["locale loop {0} {0}/".format(x) for x in locale_list]

    output_file = io.open(output_file_name, "w", encoding="UTF-8")

    manifest_output = "\n".join(localeLines) + "\n"

    output_file.write(unicode(manifest_output))

    output_file.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Loop locale chrome manifest generation script")
    parser.add_argument("--src",
                        default=DEF_L10N_SRC,
                        metavar="path",
                        help="Source path for l10n resources. Default = " + DEF_L10N_SRC)
    parser.add_argument("--output-file",
                        default=DEF_OUTPUT_FILE_NAME,
                        metavar="name",
                        help="File to be updated with the locales list. Default = " + DEF_OUTPUT_FILE_NAME)
    args = parser.parse_args()
    main(args.src, args.output_file)
