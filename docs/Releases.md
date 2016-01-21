Releases
========

This is a description of how we create the various releases for Loop. You only
need to read it if you're doing a release, although it might be of interest for
others.

Bumping Version Number of `master`
----------------------------------

Whenever a release is made, we bump the version number of master. The version of
master should always finish with `-alpha`.

To bump the version number:

```shell
$ # Checkout and update master according to your standard practice.
$ # Then run this command, which will run tests and bump the version numbers:
$ npm --no-git-tag-version version <version>-alpha
$ # If successful, commit the result
$ git commit -m "Update master version following <version> release." -a
$ # Then push the result to the repo
```

Where `<version>` is the version of the add-on just released.

Note: We don't tag alpha versions on `master`, hence the `--no-git-tag-version`

Beta Releases of the Add-on
---------------------------

TBD

Exporting Releases to mozilla-central
-------------------------------------

TBD

Releasing the Standalone UI
---------------------------

TBD
