# Dev Releases - Automatic Deploys

Releases to the dev server are automatically deployed by cronjob.

This should soon be extended to include the developer channel of the add-on on
addons.mozilla.org.

Both of these operations take the latest version from master, pull in the latest
l10n files, and package/produce output from the result.

## Dev Server Deploys

The standalone dev server is set up with a cronjob that automatically deploys
every half hour.

The script it uses is [`bin/autodeploy_standalone.sh`](../bin/autodeploy_standalone.sh).

The script expects repositories in a particular location - see its usage details
for more information.

It may be run locally for testing purporses, however running the script will
destroy any local changes in the repository.

## Add-on developer channel updates

This are not automatic yet, but should be soon. When they are, they will run once
or twice a week.

The script used is [`bin/autodeploy_devxpi.sh`](../bin/autodeploy_devxpi.sh).

More details on repository layout are documented in the usage information for the
script.

To run the script, JPM_API_KEY and JPM_API_SECRET must be specified in the
environment ([xref jpm sign](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#jpm_sign)).
The script is run with:

```shell
bin/autodeploy_devxpi.sh /path/to/repositories
```
