#!/usr/bin/python

##
# Utility module to provide utilities for dealing with locales.
##

import os


def convertLocale(locale):
    """Convert loop-client-l10n repo names to loop repo names.

    Keyword arguemnts:
    locale -- the locale name to adjust.
    """
    return locale.replace('_', '-').replace('templates', 'en-US')


def getLocalesList(src_dir):
    """Return a list of valid locales in the given directory.

    Keyword arguments:
    src_dir -- the directory to search.
    """
    locale_dirs = os.listdir(src_dir)

    locale_list = sorted([x for x in locale_dirs if x[0] != "." and os.path.isdir(os.path.join(src_dir, x))])

    def filter_locales_with_no_files(locale):
        files = os.listdir(os.path.join(src_dir, locale))

        # Find just the .properties files.
        files = [file for file in files if ".properties" in file]

        return len(files) != 0

    locale_list = [x for x in locale_list if filter_locales_with_no_files(x)]

    return [convertLocale(x) for x in locale_list]
