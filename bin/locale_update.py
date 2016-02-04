#!/usr/bin/python

##
# This script is designed to update the l10n files and locale registration for
# the standalone loop client and loop add-on. The source of the localization
# files is https://github.com/mozilla/loop-client-l10n repository.
# The loop repo is assumed to be https://github.com/mozilla/loop.
#
# Run this script from the local version of loop. It assumes that a local
# version of loop-client-l10n is in a parallel directory: ../loop-client-l10n.
##

from __future__ import print_function

import argparse
import io
import os
import re
import shutil

# defaults
DEF_L10N_SRC = os.path.join(os.pardir, "loop-client-l10n", "l10n")
DEF_L10N_DST = os.path.join("locale")
DEF_INDEX_FILE_NAME = os.path.join("standalone", "content", os.extsep.join(["index", "html"]))
DEF_JAR_FILE_NAME = os.path.join("add-on", os.extsep.join(["jar", "mn"]))


def main(l10n_src, l10n_dst, index_file_name, jar_file_name):
    print("deleting existing l10n content tree:", l10n_dst)

    old_locale_dirs = os.listdir(l10n_dst)

    for dir in old_locale_dirs:
        # Ensure we leave en-US alone.
        if dir != "en-US":
            shutil.rmtree(os.path.join(l10n_dst, dir), ignore_errors=True)

    print("updating l10n tree from", l10n_src)

    def create_locale(src_dir):
        # Convert loop-client-l10n repo names to loop repo names.
        dst_dir = src_dir.replace('_', '-').replace('templates', 'en-US')

        # Don't copy the en-US files. Stick with what's in our tree as that might
        # be a later version.
        if dst_dir != "en-US":
            # Copy the l10n files, but ignore any `.keep`
            shutil.copytree(os.path.join(l10n_src, src_dir),
                            os.path.join(l10n_dst, dst_dir),
                            ignore=shutil.ignore_patterns(".keep"))
        return dst_dir

    locale_dirs = os.listdir(l10n_src)
    locale_list = sorted([create_locale(x) for x in locale_dirs if x[0] != "."])

    print("updating locales list in", index_file_name)
    with io.open(index_file_name, "r+") as index_file:
        index_html = index_file.read()

        # Replace the one meta line with new locales.
        new_content = re.sub(
            '<meta name=(["|\'])locales\\1.*? content=(["|\']).*?\\2.*? />',
            '<meta name="locales" content="' + ",".join(locale_list) + '" />',
            index_html, 1, re.M | re.S)

        index_file.seek(0)
        index_file.truncate(0)
        index_file.write(new_content)

    print("updating locales list in", jar_file_name)
    with io.open(jar_file_name, "r+") as jar_file:
        jar_mn = jar_file.read()

        # Replace multiple locale registrations with new locales.
        # The jar.mn preprocessor can't cope with '-' so we add some defines
        # in so it can handle '_' instead.
        dashLocales = []
        for locale in locale_list:
            if "-" in locale:
                dashLocales.append('#define {0} {1}'.format(locale.replace("-", "_"), locale))

        new_content = re.sub(
            '(#define .+\n)+',
            '\n'.join(dashLocales) + '\n',
            jar_mn)

        # One big if statement to avoid lots of if/endif lines, and the preprocessor
        # can't cope with '\' on the end of the line.
        jar_locales = ['AB_CD == {0}'.format(x.replace("-", "_")) for x in locale_list]

        new_content = re.sub(
            '(#if AB_CD.+\n)',
            '#if ' + ' || '.join(jar_locales) + '\n',
            new_content)

        jar_file.seek(0)
        jar_file.truncate(0)
        jar_file.write(new_content)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Loop Stand-alone Client localization update script")
    parser.add_argument('--src',
                        default=DEF_L10N_SRC,
                        metavar="path",
                        help="Source path for l10n resources. Default = " + DEF_L10N_SRC)
    parser.add_argument('--dst',
                        default=DEF_L10N_DST,
                        metavar="path",
                        help="Destination path for l10n resources. Default = " + DEF_L10N_DST)
    parser.add_argument('--index-file',
                        default=DEF_INDEX_FILE_NAME,
                        metavar="name",
                        help="File to be updated with the locales list. Default = " + DEF_INDEX_FILE_NAME)
    parser.add_argument('--jar-file',
                        default=DEF_JAR_FILE_NAME,
                        metavar="name",
                        help="Jar file to be updated with the locales list. Default = " + DEF_JAR_FILE_NAME)
    args = parser.parse_args()
    main(args.src, args.dst, args.index_file, args.jar_file)
