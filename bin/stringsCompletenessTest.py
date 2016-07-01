#!/usr/bin/python

##
# This script is designed to validate string usage code completeness in the
# l10n property files.
#
# Run this script from the local version of loop. It assumes that a local
# version is in directory: ./bin.
##

# TODO
# further searches for finding more real string uses in code.
##

from __future__ import print_function

import argparse
import io
import os
import itertools as it
import glob
import re
import sys

NOT_USED_EXPECTED_AMOUNT = 28

DEFAULT_PROPERTY_LOCALE = "en-US"


def read_strings_from_l10n(l10n_dir, **arglist):
    # We use encoding="UTF-8" so that we have a known consistent encoding format.
    # Sometimes the locale isn't always defined correctly for python, so we try
    # to handle that here.
    string_match_pattern = re.compile(r"^([a-zA-Z0-9_\.]*)=")

    properties = {}

    l10n_files = glob.glob(os.path.join(l10n_dir, "*.properties"))

    for prop_file in l10n_files:
        property_file = io.open(prop_file, "r", encoding="UTF-8")

        for line in property_file:
            for match in re.finditer(string_match_pattern, line):
                property_key = match.group(1).encode("utf-8")

                properties[property_key] = 0

    return properties


def record_code_key(code_key, l10n_properties, not_found_string_list):
    if code_key in l10n_properties:
        l10n_properties[code_key] = 1
    else:
        # strings in code not found in properties list - what are they?
        if not_found_string_list.get(code_key):
            not_found_string_list[code_key] = not_found_string_list.get(code_key) + 1
        else:
            not_found_string_list[code_key] = 1


def find_l10n_strings(file_path, l10n_properties, not_found_string_list):
    # regex string getter methods to look for
    string_match_patterns = [
        re.compile(r"""
            _getString\(\"        # _getString is used in bootstrap.js
            ([a-zA-Z0-9_\.]*?)    # Match any valid string character
            \"\)
        """, re.VERBOSE),
        re.compile(r"""
            localizedStrings\.get\(\"  # Used in MozLoopService.jsm
            ([a-zA-Z0-9_\.]*?)    # Match any valid string character
            \"\)
        """, re.VERBOSE),
        re.compile(r"""
            mozL10n\.get\(\"      # mozL10n.get is content code.
            ([a-zA-Z0-9_\.]*?)    # Match any valid string character
            \"\)                  # Only match mozL10n.get("...")
        """, re.VERBOSE),
        re.compile(r"""
            mozL10n\.get\(\"      # mozL10n.get is content code.
            ([a-zA-Z0-9_\.]*?)    # Match any valid string character
            \",.*                 # Only match mozL10n.get("...", ...)
        """, re.VERBOSE),
    ]

    # The mulitline patterns below are designed to pick up forms such as:
    # _getString(foo ? "string1" : "string2")
    string_multiline_patterns = [
        re.compile(r"""
            _getString\(          # _getString is used in bootstrap.js
            [^)]*?                # Continue for any non-closing bracket until
            \?                    # question mark.
            \s*?\"                # Minimal iunore whitespace until first quotes
            ([a-zA-Z0-9_\.]*?)    # Match any valid string character
            \"\s*?\:\s*?\"        # Match the " : " in the middle, ignoring
                                  # whitespace and newlines
            ([a-zA-Z0-9_\.]*?)    # Match any valid string character
            \"\)                  # Final quotes.
        """, re.VERBOSE | re.DOTALL),
        re.compile(r"""
            mozL10n\.get\(        # mozL10n.get is content code.
            [^)]*?                # The rest is the same as _getString above.
            \?
            \s*?\"
            ([a-zA-Z0-9_\.]*?)
            \"\s*?\:\s*?\"
            ([a-zA-Z0-9_\.]*?)
            \"\)
        """, re.VERBOSE | re.DOTALL),
    ]

    code_file = io.open(file_path, "r", encoding="UTF-8")

    text = code_file.read()

    code_file.close()

    lines = text.split("\n")

    for pattern in string_match_patterns:
        for line in lines:
            for match in re.finditer(pattern, line):
                record_code_key(match.group(1).encode("utf-8"),
                                l10n_properties, not_found_string_list)

    for pattern in string_multiline_patterns:
        for match in re.finditer(pattern, text):
            for group in match.groups():
                record_code_key(group.encode("utf-8"),
                                l10n_properties, not_found_string_list)


def multiple_file_types(code_dir, *patterns):
    return it.chain.from_iterable(glob.glob("%s/%s" % (code_dir, pattern)) for pattern in patterns)


def check_strings_in_code(l10n_properties, not_found_string_list, **list):
    props_found = 0

    # directories to look in
    def_code_dirs = [
        "add-on/chrome",
        "add-on/chrome/modules",
        "add-on/panels/js",
        "add-on/panels/vendor",
        "shared/js",
        "standalone/content/js"
    ]

    # iterate search through files in code directories
    for code_dir in def_code_dirs:
        for fname in multiple_file_types(code_dir, "*.js", "*.jsx", "*.jsm"):
            find_l10n_strings(fname, l10n_properties, not_found_string_list)

    return props_found


def report_result(l10n_properties, not_found_string_list, **arglist):
    props_count = len(l10n_properties)
    used_strings_not_found = len(not_found_string_list)

    props_found = 0
    for string in l10n_properties:
        if l10n_properties[string]:
            props_found += 1

    props_not_used = props_count - props_found

    if props_not_used > 0:
        print("String properties not used in code (may be undetectable or obsolete):")
        for prop in sorted(l10n_properties.keys()):
            if l10n_properties.get(prop) == 0:
                print(prop)

        print("=====================")

    if used_strings_not_found > 0:
        print("Errors: Strings used in code but not defined in properties files (inc hit-count):")
        for prop2 in sorted(not_found_string_list.keys()):
            print(prop2, not_found_string_list.get(prop2))

        print("=====================")

    print("TEST-INFO | String Properties defined: %s" % props_count)

    failed = False

    if props_not_used != NOT_USED_EXPECTED_AMOUNT:
        print("TEST-UNEXPECTED-FAIL | Unexpected amount of not used strings found! Got %s, expected %s" %
              (props_not_used, NOT_USED_EXPECTED_AMOUNT))
        failed = True
    else:
        print("TEST-PASS | String Properties not used (warning): %s" % props_not_used)

    if used_strings_not_found > 0:
        print("TEST-UNEXPECTED-FAIL | Strings found in code but not defined: %s" % used_strings_not_found)
        failed = True
    else:
        print("TEST-PASS | Strings found in code are all defined")

    return failed


def main(l10n_locale):
    l10n_properties = read_strings_from_l10n(os.path.join("locale", l10n_locale))

    not_found_string_list = {}
    check_strings_in_code(l10n_properties, not_found_string_list)

    if report_result(l10n_properties, not_found_string_list):
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Loop localization string property completeness test script")
    parser.add_argument('--locale',
                        default=DEFAULT_PROPERTY_LOCALE,
                        metavar="path",
                        help="l10n locale directory used to test completeness against."
                             "Default = " + DEFAULT_PROPERTY_LOCALE)
    args = parser.parse_args()
    main(args.locale)
