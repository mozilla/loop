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

As part of the tab sharing experience, Hello reports back popular domains
(eTLD+1, e.g., `mozilla.org` for `subdomain.mozilla.org/page?query`) of the
pages shared for Mozilla to better understand what types of sites are typically
shared so that the Hello experience can be improved for those patterns. This
reporting was implemented in [bug
1211542](https://bugzilla.mozilla.org/show_bug.cgi?id=1211542) and can be turned
off by setting `loop.logDomains` preference to `false`.

"Popular" domains are hardcoded as part of the add-on in
[DomainWhitelist.jsm](../add-on/chrome/modules/DomainWhitelist.jsm). These are
roughly the global top 3000 domains with some additions of certain categories of
interest, e.g., home, travel, shopping.

The domains are reported at the end of a tab sharing session and of only those
that were actually shared with a guest, i.e., tabs opened while sharing is
active but no other participants are present are not included.
