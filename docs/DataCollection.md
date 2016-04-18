# Data Collection

This is a description of various ways Loop add-on and website sends data to
servers and Mozilla's purposes of getting the data.

[Firefox Hello Privacy Notice](https://www.mozilla.org/privacy/firefox-hello/)

## TODO

This document is very much WIP and is missing many details.

Things to be documented:

* Desktop / Link Generator data collection
* Room registration and updates
* Telemetry
* Feedback form
* Standalone / Link Clicker data collection
* Google Analytics

## Domain Logging

As part of the tab sharing experience, Hello reports back popular domains so we can see in aggregate what kinds of tasks people use Hello for.  Given some knowledge of how people use Hello we can improve the Hello experience given the specific tasks we can infer from the sites people share with Hello.  It is our intention to only see a global aggregate of these sites.

We report only on visited domains that are part of a whitelist that is shipped with Hello.  This whitelist is constructed from the top 2000 visited domains, plus some additions of the top domains in some areas of interest (home, travel, shopping) when those domains don't themselves show up in the top 2000.  The result is about 3000 domains, hardcoded in [DomainWhitelist.jsm](../add-on/chrome/modules/DomainWhitelist.jsm).

With collection turned on: during a Hello session Hello collects a list of whitelisted domains that were visited during the submission.  Only domains actually shared with a guest are included; if you start Hello and visit sites before another person connects to your session, then those initial sites are not included.

At the end of your session Hello submits a list of domains visited to the Hello server.  This list looks like:

```json
[
  {"domain": "test.com", "count": 1},
  {"domain": "google.com", "count": 5},
  {"domain": "amazon.com", "count": 3}
]
```

The domains are not in any particular order.

On the server side the values are immediately submitted to a pipeline ([see here](https://github.com/mozilla-services/loop-server/blob/34631f4dcc6f9f92b64962ad5fc1ce71e8936daf/loop/routes/rooms.js#L559)) with each domain count from the submission separated out, and no other information (e.g., we do not include IP addresses or session information with this logging).

The reporting was implemented in [bug 1211542](https://bugzilla.mozilla.org/show_bug.cgi?id=1211542) and can be turned off by setting `loop.logDomains` preference to `false`.
