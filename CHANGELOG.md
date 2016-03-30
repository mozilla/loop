# Changelog

## 1.2.4

### New

* No bug. Update python packages to the latest version and improve handling of our pip requirements. r=dcritch. [Mark Banner]

* No bug. Attempt to fix intermittent functional test failures by completing actions for closing the share panel before removing the panel itself. rs=dmose. [Mark Banner]

* Bug 1253013 - Allow Whitelist urls to be clickable in context. r=dmose. [David Critchley]

### Chores

* Update L10n from changeset 90504350c02aacdf0621c55099fb2068222cf8ce. [Mark Banner]

* Update firefox-profile to version 0.3.12. r=standard8. [greenkeeperio-bot]

### Other

* Backout bug 1257154 due to crashes and leaks seen in mozilla-central. rs=Standard8. [Mark Banner]


## v1.1.15 (2016-03-24)

### New

* Bug 1254517 - VERSION.txt is missing from loop standalone deployments. r=fcampo. [Mark Banner]

* Bug 1253013 - Allow Whitelist urls to be clickable in context. r=dmose. [David Critchley]

### Other

* 1.1.15. [David Critchley]


## v1.2.3 (2016-03-23)

### New

* Bug 1258014 - Makefile git-export find regexType on Ubuntu Linux, r=Standard8. [Chris Rafuse]

* Bug 1257154 - Switch to getting DOM title updates via a frame script, and make the add-on truely multiprocess compatible to avoid shims. r=mikedeboer. [Mark Banner]

* Bug 1258329 - Allow easy generation of a &quot;dev&quot; xpi for uploading to AMO's dev channel. r=dmose. [Mark Banner]

* Bug 1253452 - Stop the invitiation view text being cut-off. r=mancas. [Mark Banner]

* Bug 1255440 - Local and remote streams needs to be moved to the top of the text chat bar. r=crafuse. [Manuel Casas Barrado]

### Chores

* Update karma-chrome-launcher to version 0.2.3. r=standard8. [greenkeeperio-bot]

* Update babel-plugin-transform-react-jsx to version 6.7.4. r=standard8. [greenkeeperio-bot]

### Other

* 1.2.3. [Mark Banner]

* Fixes bug 1257947 - fall back to Linux skin for non Win/Mac. [Robert Helmer]


## v1.2.2 (2016-03-22)

### New

* Bug 1258834 - Disable Loop's e10s for FF 46 and Conversation pop-outs for FF 47. r=dmose. [Mark Banner]

* Bug 1257386 - Fix decryption failure causing standalone call to fail, r=Standard8. [Dan Mosedale]

* Bug 1255923 - Ice Failure log sanitization. r=Standard8. [David Critchley]

### Chores

* Update L10n from changeset 6e1a97d8e947fc20adac9b1c2a351ea31869cf38. [Mark Banner]

### Other

* 1.2.2. [Mark Banner]


## v1.2.1 (2016-03-21)

### New

* Bug 1257924 - Remove SEC_NORMAL from MozLoopPushHandler.jsm. r=sicking. [Christoph Kerschbaumer]

* No Bug. Move clientSuperShortname into shared strings to match loop-client-l10n repo and correct an l10n note. rs=dmose. [Mark Banner]

* Bug 1256357 - Enable Hello in e10s windows by default. r=Standard8. [mikedeboer]

* Bug 1256362 - Remove the 'Start a conversation' menuitem when in private browsing mode. r=mancas. [Mark Banner]

* Bug 1252128 - Update desktop client FTU start sharing tabs message when create/join conversation, r=dcritch. [Chris Rafuse]

* Bug 1211542 - Collect domain of shared URL in Hello through a whitelist. r=dcritch. [Ed Lee]

* Bug 1220627 - As a desktop client user, I want to be able to share simply the Hello URL through a sharing panel after I create a room. r=Standard8. [Manuel Casas Barrado]

### Chores

* Update L10n from changeset e18973d6f04cabbf576c03f4bbd58cc3ae510839. [Mark Banner]

* Update chai-as-promised to version 5.3.0. r=standard8. [greenkeeperio-bot]

### Other

* 1.2.1. [Mark Banner]


## v1.2.0 (2016-03-16)

### New

* No bug. When handling files, use UTF-8 encoding to avoid issues with locales not being defined correctly for python. r=dmose. [Mark Banner]

* Bug 1254699 - Use new  NPS Survey for v1.2 r=Standard8. [David Critchley]

* Bug 1257018 - Fix warning on standalone that was due to the wrong ordering of files to load. r=fcampo. [Mark Banner]

* Bug 1255491 - Disable pop-out feature in conversation window. r=dcritch. [Manuel Casas Barrado]

* Bug 1255750 - If the link clicker join a room whilst sharing is paused, the display is messed up. r=crafuse. [Manuel Casas Barrado]

* Bug 1252562 - Welcome description on standalone is awkward. r=Mardak. [Manuel Casas Barrado]

* Bug 1257009 - The link generator shouldn't try to setup tab browsing every time a link clicker leaves the room. r=Mardak. [Mark Banner]

* Bug 1256694 - Use a better maximum version definition for the add-on. r=Mardak. [Mark Banner]

* Bug 1229195 - resolve the promise when the chat window has actually finished loading, not right away. r=Standard8. [mikedeboer]

* Bug 1254940 - If the link generator exits a room whilst sharing is paused, and then re-enters, the link-clicker display is messed up. r=dcritchley. [Manuel Casas Barrado]

* Bug 1253559 - Adjust Roomlist Item dropdown menu so it does not get cut off. r=chrafuse. [David Critchley]

* Bug 1250534 - introduce a ChatboxClosed event that fires when a chatbox is closed in attached and detached mode. r=Standard8. [mikedeboer]

* Bug 1255410 - Ensure leaving the room works properly when using the leave button on the popped out conversation window. r=dmose. [Mark Banner]

* Bug 1254511 - Improve functional tests so that they can work against production and pre-release production builds for QA. r=dcritch. [Mark Banner]

* Bug 1254517 - VERSION.txt is missing from loop standalone deployments. r=fcampo. [Mark Banner]

* Bug 1254132 - Start hooking up Loop's functional tests so they can be run in e10s mode. r=mancas. [Mark Banner]

* Bug 1252061 - The clicker UI tile needs to be moved to the bottom right of the page. r=fcampo. [Manuel Casas Barrado]

* Bug 1249577 - Fix height glitchiness in Hello FTU, r=Standard8. [Dan Mosedale]

* Bug 1254958 - browser_mozLoop_telemetry.js fails due to not resetting prefs. r=mancas. [Mark Banner]

* Bug 1250443 - Remote cursor color should be blue. r=Mardak. [Manuel Casas Barrado]

* Bug 1250444 - Local speech bubbles should be grey, remote's should be blue. [Manuel Casas Barrado]

* Bug 1254945 - If text chat consists of entirely context tiles, then it doesn't automatically scroll. r=mancas. [Mark Banner]

* Bug 1252306 - Link clicker intro screen code upgrade, r=dcritchley. [Chris Rafuse]

* Bug 1252162 - Link clicker intro screen tests, r=dcritchley. [Chris Rafuse]

* No Bug. Update dependencies of packages that tend to get updated infrequently. rs=dmose. [Mark Banner]

* Bug 1253013 - Add tests for checking the context tile is only shown for valid urls. r=dmose. [Mark Banner]

* Bug 1254093 - Get the loop.debug.sdk preference working again. r=mancas. [Mark Banner]

* Bug 1249365 - Fix regression in e10s mode to re-allow the camera by default in Loop's conversation window. r=gcp. [Mark Banner]

* Bug 1249311 - additional unit tests for FTU slideshow. r=Standard8. [Vidhuran Harichandra Babu]

* Bug 1252088 - Ripple click effect needs more unit tests. r=Standard8. [Manuel Casas Barrado]

* Bug 1252817 - Stop using the timeout for requests across the content/chrome API as this interfers with network requests via the backend. Should fix a functional test issue. r=mikedeboer. [Mark Banner]

* Bug 1220767 - Set right sidebar width wider in standalone/large screen (r=mancas, ui-r=sevaan) [Fernando Campo]

* Bug 1252071 - If you re-enter a room that your peer has previously left, the UI says &quot;Your friend has left&quot;. r=dcritchley. [Manuel Casas Barrado]

* Bug 1208416 - Report on Hello MAUs per new MAU definition. r=Mardak. [Manuel Casas Barrado]

* Bug 1253013 - Display the context tile only for valid urls. r=dmose. [Mark Banner]

* Bug 1249030 - Add tooltip to Help button in Standalone. r=Standard8. [David Critchley]

* Bug 1247190 - useDesktopPaths is not used anymore and removed, r=Standard8. [jafar25]

* No bug. Fix Travis test bustage by limiting getting Google Chrome for 64 bit builds only. rs=bustage-fix. [Mark Banner]

* Bug 1245147 - Inform the link clicker when tab sharing is paused. r=Standard8. [Manuel Casas Barrado]

* Bug 1245710 - Fix RTL issues in the introductory display, and make functional tests work. r=Standard8. [Dan Mosedale]

* Bug 1245710 - Add an introductorary screen to the standalone display. r=dmose. [Chris Rafuse]

* Bug 1252450 - Enable the facebook button for shipped builds. r=fcampo. [Mark Banner]

* No bug. Fix installation of the add-on in functional tests - install it permanently rather that temporary as we still need to restart. [Mark Banner]

* Bug 1238562 - Run functional tests by default, except on travis for now. r=dcritch. [Mark Banner]

* Bug 1238562 - Add options to functional tests to run with different server setups. r=dcritch. [Mark Banner]

* Bug 1238562 - Get functional tests running in the github repository. r=dcritch. [Mark Banner]

* Bug 1239970 - Display FTU in empty room list. r=dmose. [David Critchley]

* Bug 1250126 [reg] - Moving the mouse pointer near the bottom of the standalone screen alters the link-generator display (r=mancas) [Fernando Campo]

* Bug 1251824 - Update OpenTok library to 2.7.3. r=Mardak. [Mark Banner]

* Bug 1250126 - Moving l-clicker  pointer near bottom/right edge alters l-generator display (r=dmose) [Fernando Campo]

* Bug 1250166 - Standalone -&gt; link generator cursor sharing still active when sharing is paused. [Fernando Campo]

* Bug 1248567 - [Meta] Edit a room name from the panel. [Manuel Casas Barrado]

* Bug 1245808 - Re-enable browser_mozLoop_chat.js for e10s mode now that the issues with it seem to have gone away. r=mikedeboer. [Mark Banner]

* Bug 1238533 - Clicker UI notification UI. r=dcritchley. [Manuel Casas Barrado]

* Bug 1250847: prefix DOMWindowClose with the Social: prefix to assure they won’t arrive at the global messageManager instance that TabBrowser is listening to. It mixes things up in twisted, unexpected ways if we don’t. r=Standard8. [mikedeboer]

* Bug 1237677 - Update OpenTok library to 2.7.2. r=mikedeboer. [Mark Banner]

* Bug 1243594 (part 3) - leave the utf-8 encoding of the payload to rest.js instead of directly in loop. r=Standard8. [Mark Banner]

* Bug 1249552 - Remove the old unsupported loop.fxa.enabled preference. r=fcampo. [Mark Banner]

* No Bug - Timing change within the check video and switch to chatbox to allow DOM catch up. r=standard8. [David Critchley]

* Bug 1245277 loop addon needs to respect prior set default prefs, not restartless, r=Standard8. [Mark Banner]

* Bug 1192208 - Ripple effect on click when in a tab sharing session with shared pointers [2/2] [Fernando Campo]

* Bug 1192208 - Ripple effect on click when in a tab sharing session with shared pointers [1/2] [Manuel Casas Barrado]

* Bug 1250495 - Improved privacy by opening Hello FTU Url when there is no context url r=standard8. [David Critchley]

* Bug 1248895 - Open Hello panel after FTU is closed. [David Critchley]

* Bug 1240516 - Add in-chat notification on peer disconnect by handling RemotePeerDisconnect event in textChatStore. r=Standard8. [Vidhuran Harichandra Babu]

* Bug 1247785 - Remove unused strings for Invite Text header. [Manuel Casas Barrado]

* Bug 1244721 - Make panel gear icon bigger. r=fcampo. [Manuel Casas Barrado]

### Chores

* Update eslint-plugin-react to version 4.2.3. r=standard8. [greenkeeperio-bot]

* Update backbone to version 1.3.2. r=standard8. [greenkeeperio-bot]

* Update eslint-plugin-react to version 4.2.2. r=standard8. [greenkeeperio-bot]

* Update L10n from changeset cec3928c33bf6bf791744f40264970ebf7605b7d. [Mark Banner]

* Update L10n from changeset 1d73d0787992e99529929b8cbf0b871e34e34fe3. [Mark Banner]

* Update karma to version 0.13.22. r=standard8. [greenkeeperio-bot]

* Update eslint-plugin-react to version 4.2.1. r=standard8. [greenkeeperio-bot]

* Update Firefox max version to match the new nightly version. rs=bustage-fix. [Mark Banner]

* Update karma-coverage to version 0.5.5. r=standard8. [greenkeeperio-bot]

* Update babel-cli to version 6.6.5. r=standard8. [greenkeeperio-bot]

* Update babel-plugin-transform-react-jsx to version 6.6.5. r=standard8. [greenkeeperio-bot]

* Update eslint-plugin-react to version 4.2.0. r=standard8. [greenkeeperio-bot]

* Update backbone to version 1.3.1. r=standard8. [greenkeeperio-bot]

* Update babel-cli to version 6.6.4. r=standard8. [greenkeeperio-bot]

* Update babel-plugin-transform-react-jsx to version 6.6.4. r=standard8. [greenkeeperio-bot]

* Update karma-coverage to version 0.5.4. r=standard8. [greenkeeperio-bot]

* Update L10n from changeset 38755fbbc6a87fd405ac2eccf88e9147a0ee9b31. [Mark Banner]

* Update babel-plugin-transform-react-jsx to version 6.6.0. r=standard8. [greenkeeperio-bot]

* Update fs-promise to version 0.5.0. r=standard8. [greenkeeperio-bot]

* Bump minimum version to 46.0a1 since 45 doesn't have the required e10s changes. rs=release. [Mark Banner]

* Update L10n from changeset c7891ecea3c1474fe3e31afda0552fd06f50de47. [Mark Banner]

* Update nodemon to version 1.9.1. r=standard8. [greenkeeperio-bot]

* Update jpm to version 1.0.6. r=standard8. [greenkeeperio-bot]

* Update webpack to version 1.12.14. r=standard8. [greenkeeperio-bot]

* Update nodemon to version 1.9.0. r=standard8. [greenkeeperio-bot]

### Other

* 1.2.0. [Mark Banner]

* Avoid eslint rule deprecation warning for sort-prop-types. r=Standard8. [Ed Lee]

* Follow-up to Bug 1255410 - fix the conversation window when leaving a conversation to make it work properly. r=Mardak. [Mark Banner]

* Make nodemon watch locale directory and properties files and rebuild on change. r=dmose. [Ed Lee]

* Changes to contributing document. r=standard8. [David Critchley]

* Backout bug 1237677 due to bug 1248407 - causing devices not to be released properly. rs=backout-for-issues. [Mark Banner]


## v1.1.14 (2016-03-14)

### New

* No bug. Change the call for opening the call panel since bug 1154277 was backed out. rs=Mardak. [Mark Banner]

### Other

* 1.1.14. [Mark Banner]


## v1.1.13 (2016-03-14)

### New

* Bug 1256442 - Various updates to get the 1.1.x version of the system add-on ready for 45 release. r=Mardak. [Mark Banner]

### Other

* 1.1.13. [Mark Banner]

* Backout fa9983c5b09ded16fd5f2ed8c60ef1c63486a3fd / bug 1154277 Part 1 - remove e10s related commits. [Mark Banner]

* Backout 2354436cd1a6e7293609b4eb79aa1582013a8083 / bug 1154277 Part 2 - remove e10s related commits. [Mark Banner]

* Backout 36af5ef9c60669695631127864cc0f40dd57174a / bug 1154277 Part 3 - remove e10s related commits. [Mark Banner]

* Backout 991273be3ffcdbd111959a0a2e072a36fdd67d25 / bug 1229195 - MozLoopService#openChatWindow should return a Promise - remove e10s related commits. [Mark Banner]

* Backout 712567ce9c21623fc46dc01f066fba7419706fb7 / bug 1245813 - remove e10s related commits. [Mark Banner]

* Backout 1d1bd1a001103af8eff318dd83e611d7c78ede1b / bug 1250847 - remove e10s related commits. [Mark Banner]

* Backout ebef3ce5140ad16f56a95c7842048c36c8564e5b / bug 1249365 - remove e10s related commits. [Mark Banner]

* Backout e943fed2b0f497c7940eed64f46b8e067ae1147c / Bug 1250534 - remove e10s related commits. [Mark Banner]

* Backout 6ceea4148fea695c65f45ff23b1be1475ba16b45 / Bug 1247255 - remove e10s related commits. [Mark Banner]

* Backout changeset 45d3299328516bc18a21f77c508807f4f27ed612 / Bug 1154277 follow-up - remove e10s related commits. [Mark Banner]


## v1.1.12 (2016-03-14)

### New

* Bug 1250534 - introduce a ChatboxClosed event that fires when a chatbox is closed in attached and detached mode. r=Standard8. [mikedeboer]

* Bug 1249365 - Fix regression in e10s mode to re-allow the camera by default in Loop's conversation window. r=gcp. [Mark Banner]

* Bug 1249577 - Fix height glitchiness in Hello FTU, r=Standard8. [Dan Mosedale]

### Chores

* Update L10n from changeset cec3928c33bf6bf791744f40264970ebf7605b7d. [Mark Banner]

* Update L10n from changeset 1d73d0787992e99529929b8cbf0b871e34e34fe3. [Mark Banner]

### Other

* 1.1.12. [Mark Banner]


## v1.1.11 (2016-03-04)

### New

* Bug 1252817 - Stop using the timeout for requests across the content/chrome API as this interfers with network requests via the backend. Should fix a functional test issue. r=mikedeboer. [Mark Banner]

### Other

* 1.1.11. [Mark Banner]


## v1.1.10 (2016-03-03)

### New

* Bug 1253013 - Display the context tile only for valid urls. r=dmose. [Mark Banner]

* No bug. Fix Travis test bustage by limiting getting Google Chrome for 64 bit builds only. rs=bustage-fix. [Mark Banner]

* Bug 1245147 - Inform the link clicker when tab sharing is paused. r=Standard8. [Manuel Casas Barrado]

* Bug 1245710 - Fix RTL issues in the introductory display, and make functional tests work. r=Standard8. [Dan Mosedale]

* Bug 1245710 - Add an introductorary screen to the standalone display. r=dmose. [Chris Rafuse]

* Bug 1250126 [reg] - Moving the mouse pointer near the bottom of the standalone screen alters the link-generator display (r=mancas) [Fernando Campo]

* Bug 1250126 - Moving l-clicker  pointer near bottom/right edge alters l-generator display (r=dmose) [Fernando Campo]

### Chores

* Update L10n from changeset 38755fbbc6a87fd405ac2eccf88e9147a0ee9b31. [Mark Banner]

### Other

* 1.1.10. [Mark Banner]


## v1.1.9 (2016-02-29)

### New

* Bug 1245808 - Re-enable browser_mozLoop_chat.js for e10s mode now that the issues with it seem to have gone away. r=mikedeboer. [Mark Banner]

* Bug 1251824 - Update OpenTok library to 2.7.3. r=Mardak. [Mark Banner]

* Bug 1250126 - Moving l-clicker  pointer near bottom/right edge alters l-generator display (r=dmose) [Fernando Campo]

* Bug 1250166 - Standalone -&gt; link generator cursor sharing still active when sharing is paused. [Fernando Campo]

* Bug 1243594 (part 3) - leave the utf-8 encoding of the payload to rest.js instead of directly in loop. r=Standard8. [Mark Banner]

* Bug 1250847: prefix DOMWindowClose with the Social: prefix to assure they won’t arrive at the global messageManager instance that TabBrowser is listening to. It mixes things up in twisted, unexpected ways if we don’t. r=Standard8. [mikedeboer]

* No Bug - Timing change within the check video and switch to chatbox to allow DOM catch up. r=standard8. [David Critchley]

* Bug 1245277 loop addon needs to respect prior set default prefs, not restartless, r=Standard8. [Mark Banner]

* Bug 1250495 - Improved privacy by opening Hello FTU Url when there is no context url r=standard8. [David Critchley]

* Bug 1248895 - Open Hello panel after FTU is closed. [David Critchley]

* Bug 1229195: prevent a JS error related to the UITour on beta and allow for a longer period of time before timeout in mochitests. r=Standard8. [mikedeboer]

* Bug 1249015 - Context is still updated in standalone when sharing is stopped. r=mancas. [Ed Lee]

* Bug 1248491 - Simplify the standalone dist build process to not build the add-on artifacts to help with deployment. r=phrawzty. [Mark Banner]

* Bug 1248960 - Add an option to run the dev server without watching files, and switch functional tests to use it, and update the url for the tests. r=Mardak. [Mark Banner]

* Bug 1248530 - Wrong vertical offset for shared pointer on link clicker side (r=Mardak) [Fernando Campo]

* No bug. Fix case-sensitive bug for the FTU tour. Follow-up to bug 1245666. [Mark Banner]

* No bug. Fix xpcshell-test failures from bug 1245608 - update the number of listeners. rs=me for test bustage fix. [Mark Banner]

* No Bug - remove left-over console.info statement. r=me. [mikedeboer]

### Chores

* Bump minimum version to 46.0a1 since 45 doesn't have the required e10s changes. rs=release. [Mark Banner]

* Update L10n from changeset c7891ecea3c1474fe3e31afda0552fd06f50de47. [Mark Banner]

* Update karma to version 0.13.21. r=standard8. [greenkeeperio-bot]

* Update karma-mocha to version 0.2.2. r=standard8. [greenkeeperio-bot]

* Update master version following v1.1.2 release. [Mark Banner]

### Other

* 1.1.9. [Mark Banner]

* Backout bug 1250126 / changeset da00826f24ee3301fbc989d5b3ec18b93c261616 from release due to regressions. [Mark Banner]

* 1.1.8. [Mark Banner]


## v1.1.7 (2016-02-19)

### Other

* 1.1.7. [Mark Banner]


## v1.1.6 (2016-02-19)

### Other

* 1.1.6. [Mark Banner]

* Reland bug 1237677 - OpenTok library update to 2.7.2 for a 1.1.6 release bump. [Mark Banner]


## v1.1.5 (2016-02-18)

### New

* Bug 1248491 - Simplify the standalone dist build process to not build the add-on artifacts to help with deployment. r=phrawzty. [Mark Banner]

### Other

* 1.1.5. [Mark Banner]


## v1.1.4 (2016-02-15)

### Other

* 1.1.4. [Mark Banner]

* Fix bustage from previous switch to unicode. [Mark Banner]


## v1.1.3 (2016-02-15)

### New

* No bug. Attempt to fix bustage for standalone when language isn't defined. [Mark Banner]

### Other

* 1.1.3. [Mark Banner]

* Backout bug 1237677 - OpenTok library update to 2.7.2 due to regressions on standalone UI (bug 1248407) [Mark Banner]


## v1.1.2 (2016-02-15)

### New

* No bug. Fix case-sensitive bug for the FTU tour. Follow-up to bug 1245666. [Mark Banner]

### Other

* 1.1.2. [Mark Banner]


## v1.1.1 (2016-02-15)

### New

* No bug. Enable the facebook button for shipped builds. [Mark Banner]

* No Bug. Disable MAU telemetry tests until the core part of bug 1208416 has landed. [Mark Banner]

* No bug. Fix xpcshell-test failures from bug 1245608 - update the number of listeners. rs=me for test bustage fix. [Mark Banner]

### Other

* 1.1.1. [Mark Banner]


## v1.1.0 (2016-02-15)

### New

* No Bug - remove left-over console.info statement. r=me. [mikedeboer]

* Bug 1245666 - Select &amp; style or implement react slideshow component. r=Standard8. [Chris Rafuse]

* Bug 1245608 - Implement slideshow frame for Hello, r=Standard8. [Dan Mosedale]

* Bug 1238530 - Clicker UI top bar. r=mikedeboer. [Manuel Casas Barrado]

* No Bug. Fix the invitiation view on the ui-showcase. r=Mardak. [Mark Banner]

* Bug 1245813 - When docShells have been swapped during chat window detach or re-attach, make sure the messageListeners are re-initialized. r=Standard8. [mikedeboer]

* Bug 1247424 - Import l10n changes from m-c and get git-export working again. r=Mardak. [Mark Banner]

* Bug 1208416 - Report on Hello MAUs per new MAU definition. r=mikedeboer. [Manuel Casas Barrado]

* Bug 1242706 - Make sharing affordances in desktop invitation view clearer and modal. Content changes. [David Critchley]

* Bug 1239241 - Facebook SEND button for sharing conversation. [Fernando Campo]

* Bug 1247255 - Include a workaround for opening the Loop panel from the Hello homepage until FF is updated with the new API. r=mikedeboer. [Mark Banner]

* Bug 1210606 - share pointer from standalone to desktop [3/3] [Fernando Campo]

* Bug 1210606 - share pointer from standalone to desktop [1/3] [Fernando Campo]

* Bug 1245486 - Send Telemetry events for use of the &quot;Pause&quot; and &quot;Restart&quot; buttons. r=mikedeboer. [Manuel Casas Barrado]

* Bug 1246934 - Report the add-on version to the server. r=mikedeboer. [Mark Banner]

* Bug 1225038 - Remove obsolete functions from NotificationCollection, r=Standard8. [malayaleecoder]

* Bug 1240970 - Design/Copy/UX for Hello FTU Initiator Slideshow Strings, r=dmose. [Chris Rafuse]

* Bug 1239970 - Locale string changes for FTU content in room list. [David Critchley]

* Bug 1242706 - Make sharing affordances in desktop invitation view clearer and modal. String changes. [David Critchley]

* Bug 1245815 - Add documentation for a lot of the release process and various tidy ups for the repo/workflow. r=Mardak. [Mark Banner]

* Bug 1245815 - Add automation to locale_update to make it update the source repo and give a suggested commit. r=Mardak. [Mark Banner]

* Bug 1239972 - Adapt infobar message based on whether a link clicker is in the room or not, r=dmose. [Chris Rafuse]

* Bug 1229195 - MozLoopService#openChatWindow should return a Promise that is resolved with the window ID. r=Standard8. [mikedeboer]

* Bug 1246168 - When the UI gets torn down, make sure we remove the menuitem as well. r=mikedeboer. [Mark Banner]

* Bug 1245149 - Inform link clickers on mobile that they should use a desktop. r=mikedeboer. [Manuel Casas Barrado]

* Bug 1246621 - Fix functional test failures adjusting for the e10s changes made to the chat window. r=mikedeboer. [Mark Banner]

* Bug 1246621 - Make functional tests lintable. r=mikedeboer. [Mark Banner]

* Bug 1244621 - Change link clicker UI favicon to Firefox Hello logo. r=Standard8. [Manuel Casas Barrado]

* Bug 1239828 - Fix the locale_update script to not include locales if they don't have any properties files. [Mark Banner]

* Bug 1245478 - Move display name setting for room joins to a central location in the content code. r=dcritch. [Mark Banner]

### Chores

* Update L10n from changeset 3f8ae4aef19ca1dcd86b909052f03a6cc573ecf1. [Mark Banner]

* Update L10n from changeset c802f9afb25920431287327317b9a69ebac89014. [Mark Banner]

* Update babel-plugin-transform-react-jsx to version 6.5.2. r=standard8. [greenkeeperio-bot]

* Update rimraf to version 2.5.2. r=standard8. [greenkeeperio-bot]

* Update exports-loader to version 0.6.3. r=standard8. [greenkeeperio-bot]

* Update babel-plugin-transform-react-display-name to version 6.5.0. r=standard8. [greenkeeperio-bot]

* Update babel-plugin-transform-react-jsx to version 6.5.0. r=standard8. [greenkeeperio-bot]

* Update babel-cli to version 6.5.1. r=standard8. [greenkeeperio-bot]

* Update webpack to version 1.12.13. r=standard8. [greenkeeperio-bot]

### Other

* 1.1.0. [Mark Banner]

* Bug 1210606 - share pointer from standalone to desktop [2/3] [Fernando Campo]

* Update master version following 0.3.0 release. [Mark Banner]


## v0.3.0 (2016-02-04)

### New

* Bug 1154277 - follow-up: hook panel close to content window.close again. r=Standard8. [mikedeboer]

* Bug 1154277: Part 3 - make chat windows run in the content process and re-enable browser sharing. r=Standard8. [mikedeboer]

* Bug 1154277: Part 2 - adjust unit tests to Social API code changes. r=Standard8. [mikedeboer]

* Bug 1154277: Part 1 - introduce a pref to switch e10s support for Loop/ Hello on or off. The default for now is off. r=Standard8. [mikedeboer]

* Bug 1239828 - Update the locale list via the automatic generation. r=Mardak. [Mark Banner]

* Bug 1239828 - Make export work for L10n. Re-arrange L10n to work well with mozilla-central rules. r=Mardak. [Mark Banner]

* Bug 1244539 - Pointer still gets shared when tab sharing is stopped/paused. r=Mardak. [Manuel Casas Barrado]

* Bug 1244744 - Pointer is not visible in standalone on Chrome. r=mancas. [Ed Lee]

* Bug 1240761 - Disabled/grey toolbar icon shown on Windows 10 fix r=standard8. [David Critchley]

* Bug 1210588 - Add a remote cursor view that calculates the cursor position based on video and stream size. r=Mardak. [Manuel Casas Barrado]

* Bug 1210588 - Handle receiving cursor events and video dimension changes in the remote cursor store. r=Mardak. [Manuel Casas Barrado]

* Bug 1210588 - Setup cursor data channels like the text channels and send cursor position. r=Mardak. [Manuel Casas Barrado]

* Bug 1210588 - Listen to mousemove events on desktop to pass to a remote cursor store. r=Mardak. [Manuel Casas Barrado]

* Bug 1234183 - Auto Resize panel height for number of items in Room list. [David Critchley]

* Bug 1244119 - Improve the release process; handle alpha version better and improve locale imports. r=mardak. [Mark Banner]

* Bug 1244055 - Enable browser_mozLoop_telemetry.js in e10s mode. r=mikedeboer. [Mark Banner]

* Bug 1239978 - Change notification copy when someone joins a room. r=mikedeboer. [Manuel Casas Barrado]

* Bug 1242524 - Remove old telemetry hooks from Loop (context add/click and sharing state change) [Manuel Casas Barrado]

* Bug 1239634 - Change some new user journey strings, r=Mardak. [Chris Rafuse]

### Chores

* Update L10n from changeset 46a995eebbc7fd8d2f66eeb83aafaf2aa4f460ee. [Mark Banner]

* Update L10n from changeset ac451eaaae603b8752fbf9e9c77dfa068a147510. [Mark Banner]

* Update fx-runner to version 1.0.1. r=standard8. [greenkeeperio-bot]

* Update fs-promise to version 0.4.1. r=standard8. [greenkeeperio-bot]

* Update mocha to version 2.4.5. r=Standard8. [greenkeeperio-bot]

* Update chai to version 3.5.0. r=Standard8. [greenkeeperio-bot]

* Update express to version 4.13.4. r=Standard8. [greenkeeperio-bot]

* Update mocha to version 2.4.4. r=Standard8. [greenkeeperio-bot]

* Update master's version post 0.2.0 release. [Mark Banner]

### Other

* 0.3.0. [Mark Banner]

* Fix the tiles support url used for local standalone server instances. rs=dmose. [Mark Banner]

* Fix functional test breakage w/Ubuntu auto-installing add-ons, r=Standard8. [Nils Ohlmeier]


## v0.2.0 (2016-01-27)

### New

* Bug 1242908 - Remove some obsolete configuration settings in the standalone server. r=fcampo. [Mark Banner]

* Bug 1240512 - added onerror handler for POST requsts in standaloneMozLoop. r=Standard8. [Vidhuran Harichandra Babu]

* Bug 1242425 - Add ChangeLog generation for releases. r=crafuse. [Mark Banner]

* Bug 1241063 - browser_mozLoop_sharingListeners.js is timing out. r=mikedeboer. [Ed Lee]

* Bug 1196143 - IDN homograph attack in firefox hello chat. [Chris Rafuse]

* Bug 1239634 - Change some new user journey strings, r=Mardak. [Chris Rafuse]

* Bug 1233701 - Hello button has increased hight of Navigation bar r=Standard8. [David Critchley]

* Bug 1233045 - Update MakeFile dist for standalone r=standard8. [David Critchley]

* Bug 1241649 - Change the version on master to 0.2.0alpha for development channel on AMO. r=Mardak. [Mark Banner]

* Bug 1241649 - Hook up `npm version` to be able to bump the install.rdf.in and prepare for releases. r=Mardak. [Mark Banner]

* Bug 1238509 - Drop some obsolete preferences. r=Standard8. [Martin Pinto-Bazurco]

* Bug 1237662 - Set up a script to automatically import from the loop-client-l10n directory. r=Standard8. [Ed Lee]

* Bug 1236336 - If there is no page details, fallback to displaying untitled page rather than null. r=Standard8. [Sarthak Munshi]

* Bug 1237677 - Update OpenTok library to 2.7.2. r=mikedeboer. [Mark Banner]

* Bug 1239246 - added prefs to enable/disable facebook share button in conversations waiting room. r=Standard8. [Vidhuran Harichandra Babu]

* Bug 1239963 - Stop unloading style sheets and destorying the loop-button on shutdown to help performance and Talos test failures. r=mikedeboer. [Mark Banner]

* Bug 1232707 - Part 2. Add an export option for exporting to mozilla-central. r=dmose,r=mikedeboer. [Mark Banner]

* Bug 1232707 - Part 1. Make the shared tests use the L10n file from desktop as that will be the only one available in m-c. Also make the desktop mozL10n api closer to the standalone version. r=dmose,r=mikedeboer. [Mark Banner]

* Bug 1239780 - Port Bug 1101817 - Part 5: Remove WeakMap.prototype.clear from Loop addon. Also account for different Firefox versions. r=Mardak. [Mark Banner]

* Bug 1238170 - Make dev server room routing code more readable, r=Standard8. [Dan Mosedale]

* Bug 1220608 - As a desktop client user in a sharing session, I can pause/restart sharing my tabs. r=mikedeboer. [Manuel Casas Barrado]

* Bug 1238510 - The loop.browserSharing.showInfoBar should be dropped (r=Mardak) [Fernando Campo]

* Bug 1233748 - Update contributing docs with autolander information. r=standard8. [Kevin Grandon]

* Bug 1238682 - As a desktop client user, when in a Hello session opening a new tab should open about:home r=mikedeboer. [Ed Lee]

* Bug 1232111 - Add initial developing document. r=dcritch. [Mark Banner]

### Chores

* Update L10n from changeset 1567b00c143481bac6b841b172d3321e05668837. [Mark Banner]

* Update mocha to version 2.4.2. r=Standard8. [greenkeeperio-bot]

* Update sinon to version 1.17.3. r=Standard8. r=Standard8. [greenkeeperio-bot]

* Update mocha to version 2.4.1. r=Standard8. [greenkeeperio-bot]

* Update webpack to version 1.12.12. r=Standard8. [greenkeeperio-bot]

* Update eslint-plugin-react to version 3.16.1. r=Standard8. [greenkeeperio-bot]

* Update rimraf to version 2.5.1. r=Standard8. [greenkeeperio-bot]

* Update babel-cli to version 6.4.5. r=Standard8. [greenkeeperio-bot]

* Update compression to version 1.6.1. r=Standard8. r=Standard8. [greenkeeperio-bot]

* Update webpack to version 1.12.11. r=Standard8. [greenkeeperio-bot]

* Update fx-runner to version 1.0.0. r=Standard8. [greenkeeperio-bot]

* Update eslint-plugin-react to version 3.15.0. r=Standard8. [greenkeeperio-bot]

### Other

* 0.2.0. [Mark Banner]

* Backout bug 1239634 / changeset ece8093 - Change some new user journey strings - due to not wanting to release string changes yet. rs=Standard8. [Mark Banner]

* Remove obsolete README files. rs=dmose. [Mark Banner]

* UI Showcase facebookEnabled required property. r=Standard8. [Chris Rafuse]

* Update CONTRIBUTING.md with the Definition of Done. r=Standard8. [Dan Mosedale]

* Makefile fix using abspath, r=dmose. [Chris Rafuse]

* Makefile node modules directory regression fix, r=dmose. [Chris Rafuse]

* Update L10n from changeset 75e0724259d6a4645ee6c4b96a47d76332de6820. [Ed Lee]

* Follow to bug 1232707 - Adjust how react is included into Loop in release and debug configurations. r=glandium. [Mark Banner]

* Make nodemon watch jsm files and rebuild on change, r=Standard8. [Dan Mosedale]

* Ignore the pep8 error for module imports not being at the top of the file and fix versions of flake8 dependencies to stop them being updated underneath us. r=crafuse. [Mark Banner]


## v0.1.0 (2016-01-25)

### New

* Bug 1241649 - Hook up `npm version` to be able to bump the install.rdf.in and prepare for releases. r=Mardak. [Mark Banner]

* Bug 1232707 - Part 2. Add an export option for exporting to mozilla-central. r=dmose,r=mikedeboer. [Mark Banner]

* Bug 1232707 - Part 1. Make the shared tests use the L10n file from desktop as that will be the only one available in m-c. Also make the desktop mozL10n api closer to the standalone version. r=dmose,r=mikedeboer. [Mark Banner]

* Bug 1236082 - Increase user identity email address display in Loop panel footer, r=dmose. [Chris Rafuse]

* Bug 1237587 - Disable FTU tour before FF45 hits beta, r=dmose. [Chris Rafuse]

* Bug 1230102 - Re-enable the functional tests for Loop. r=mikedeboer. [Mark Banner]

* Bug 1236368 - Make createRoom a bit more resilient to failure conditions. r=mikedeboer. [Mark Banner]

* Bug 1230477 - point to an updated Hello support page for the new user journey. r=Standard8. [mikedeboer]

* Bug 1210754 - Use InitPublisher completion handler callbacks for handling getUserMedia errors r=standard8. [David Critchley]

* Bug 1205661 - Blue shade of icon in toolbar does not match other blue icons. r=mikedeboer. [Fernando Campo]

* Bug 1237781 - Fix unnecessary rebuild bug and simplify Makefile, r=Mardak. [Dan Mosedale]

* Bug 1226607 - When there's no converstions - the UX isn't matching New User Journey, r=Mardak. [Chris Rafuse]

* Bug 1232663 - Close loop panel on sign in and close only the dropdownmenu on sign out from settings menu. r=Standard8. [Vidhuran Harichandra Babu]

* Bug 1237102 - only rebuild jsx files when they've changed, r=Standard8. [Dan Mosedale]

* Bug 1234904 - Update babel to the latest version, adapt for new sub-module structure. r=crafuse. [Mark Banner]

* Bug 1237042 - Clean up strings in preparation for localization r=Standard8. [Ed Lee]

* Bug 1178304 - Facebook share button in conversation when waiting alone. r=dmose. [Fernando Campo]

* Bug 1236917 - UX showcase only shows the FTU display for all the panel views. r=mikedeboer. [Mark Banner]

* Bug 1228998 - Avoid setting FINAL_TARGET in browser/extensions/loop/moz.build. r=mshal. [Mike Hommey]

* Bug 1070208 - pass fxAProfileUid as query param to fxa settings page so it opens the right account. r=Standard8. [Vidhuran Harichandra Babu]

* Bug 1231804 - In conversation window remove the gear button and put audio/face mute buttons at the center. r=mikedeboer. [Manuel Casas Barrado]

* Bug 1215612 - Add a context tile to the text chat every time context changes. r=Standard8. [Manuel Casas Barrado]

* Bug 1232720 - Create a make dist command that begins with making a production ready xpi. r=Mardak. [Mark Banner]

* Bug 1231697: add a Firefox runner that links the add-on to aid in development. r=Mardak. [Mike de Boer]

* Bug 1227539: Part 2 - implement the new HangupNow action on standalone too so that leaving a room will still work. r=Standard8. [Mike de Boer]

* Bug 1227539: Part 1 - close a chat window properly, including stopping all sharing and leaving the room. r=Standard8. [Mike de Boer]

* Bug 1232684 - Use makeFile to generate chrome.manifest from jar.mn, r=Standard8. [Chris Rafuse]

* Bug 1228728 - Fix bad layout on conversation windows when using the 'Medium' size in Windows' display settings. r=dcritch. [Mark Banner]

* Bug 1232793 - Update npm modules in github repo, r=Standard8. [Chris Rafuse]

* Bug 1230058 - Remove unused string properties, r=dmose. [Chris Rafuse]

* Bug 1230946 - Tab sharing is unpaused when switching tabs. r=mikedeboer. [Manuel Casas Barrado]

* Bug 1233189 - Duplicated string first_time_experience_button_label in loop.properties. r=Standard8. [Chris Rafuse]

* Bug 1231808 - Hide Pause button in Infobar using CSS r=Standard8. [David Critchley]

* Bug 1232441 - Add panel tests to karma, get the shared tests running in Chrome when run locally. r=dmose. [Mark Banner]

* Bug 1232691 - Where possible use the main vendor libraries from node_modules rather than importing them. r=dmose. [Mark Banner]

* Bug 1232691 - Use vendor libraries for testing from node_modules rather than manually importing them. r=dmose. [Mark Banner]

* Bug 1229933: create the Loop menu item in the browser Tools menu dynamically from the extension and remove it from core browser code. r=Standard8. [Mike de Boer]

* Bug 1219158 - update Hello FTU panel height, r=mikedeboer. [Chris Rafuse]

* Bug 1219158 - FTU panel visual UI update, r=mikedeboer. [Chris Rafuse]

* Bug 1232994 - Really enable the no unused variables rule in eslint. r=dcritch. [Mark Banner]

* Bug 1231931 - Incorporate desktop strings and split into multiple files, r=Standard8. [Chris Rafuse]

* Bug 1232111 - Update the README file with skeleton docs. r=Mardak. [Mark Banner]

* Bug 1231808 - Hide pause from Infobar. [David Critchley]

* Bug 1232030 - Rebuild npm install if package.json changed,r=Standard8. [Chris Rafuse]

* Bug 1231553 - Inset shadow makes most of the notification bar dark. r=mikedeboer. [Manuel Casas Barrado]

* Bug 1215570 - Update the rooms context whenever the domain/tab changes whilst tab sharing. r=standard8. [Manuel Casas Barrado]

* Bug 1232155 - Remove obsolete files. r=Mardak. [Mark Banner]

* Bug 1231747 - Clean up eslintignore and update eslintrc. r=Standard8. [Ed Lee]

* Bug 1231747 - Rewrite/remove non-standard/es7/unused code/prefs/sounds to allow eslint parsing. r=Standard8. [Ed Lee]

* Bug 1231960 - Don't rebuild .venv if the requirements haven't changed, r=dmose. [David Critchley]

* Bug 1231650 - eslint doesn't run against the whole repo. r=Mardak. [Mark Banner]

* Bug 1231374 - Move bootstrap.js and gecko eslintrc into add-on/chrome. r=Standard8. [Ed Lee]

* Bug 1231374 - Get the standalone server and unit tests running; add Karma test coverage. r=Mardak. [Mark Banner]

* Bug 1231374 - Add a basic build structure and lint tests. r=Mardak. [Mark Banner]

* Bug 1231374 - Remove generated files from the repository and set up basic ignore files. r=Mardak. [Mark Banner]

* Bug 1206683 - Enable eslint rule for no unused variables for Loop. r=Mardak. [Mark Banner]

* Bug 1227105 - Add cryptoKey to storeState for use in retry action and fix for TypeError in standaloneRoomViews to make retrying work better in more instances. r=Standard8. [Vidhuran Harichandra Babu]

* Bug 1227105 - Add an onerror handler for Get requests in standaloneMozLoop so that issues contacting the server are correctly reported to the user. r=Standard8. [Vidhuran Harichandra Babu]

* Bug 1230192 - Loop's desktop unit tests are doing lots of unnecessary console.log of dispatcher actions. r=dcritch. [Mark Banner]

* Bug 1230147 - Loop is attempting to load OpenTok SDK's configs from the wrong places. r=mikedeboer. [Mark Banner]

* Bug 1230088 - Update Loop's use of eslint and eslint-plugin-react, fix warnings in latest versions and add a few more rules. r=mancus. [Mark Banner]

* Bug 1214215: Part 3 - disable functional tests temporarily until bug 1229926 is resolved. r=Standard8. [Mike de Boer]

* Bug 1214215: Part 2 - remove screen sharing controls entirely from the conversation window. r=Standard8. [Mike de Boer]

* Bug 1214215: Part 1 - start sharing browser tabs when owner joins the room. r=Standard8. [Mike de Boer]

* Bug 1228999 - Undo css workaround in Loop's system-addon that was necessary as AUTHOR_SHEETS were previously not working correctly. r=mikedeboer. [Mark Banner]

* Bug 1229471 - LoopUI shouldn't try to use toolbar buttons in the hidden window. r=mikedeboer. [Mark Banner]

* Bug 1229492 - Hello fails on Linux as a system add-on due to trying to load platform.css that doesn't exist. r=mikedeboer. [Mark Banner]

* Bug 1229004 - Rename the libs directory to vendor in browser/extensions/loop/standalone/content. r=dmose. [Mark Banner]

* Bug 1201902 - Add new feedback link to Loop's panel menu. r=Standard8. [Mike de Boer]

* Bug 1225832: partially fix UITour for Loop without navigator.mozLoop present. r=Standard8. [Mike de Boer]

* No bug. Fix Loop's run-all-loop-tests script to run eslint correctly in the new world. rs=dmose NPOTB DONTBUILD. [Mark Banner]

* Bug 1227539: allow a single argument to be passed to push message subscribers. r=Standard8. [Mike de Boer]

* Bug 1228514 - Update the ID of infobar_screenshare_browser_message. r=Standard8. [Manuel Casas Barrado]

* Bug 1228628 - Add a minimal .eslintrc configuration for browser and start linting a few browser files with basic rules. r=Mossop. [Mark Banner]

* Bug 1223573 - Part 8. Work around assertions caused by attempting to load the style sheets as author sheets - load them as user sheets for now. r=mikedeboer. [Mark Banner]

* Bug 1223573 - Part 7. Add support in bootstrap.js for starting Loop and displaying the button. Also get all tests passing again. r=mikedeboer. [Mark Banner]

* Bug 1223573 - Part 6. Tidy up bootstrap.js add enough setup to get xpcshell-tests passing again. r=mikedeboer. [Mark Banner]

* Bug 1223573 - Part 5. Update uris and paths for files in Loop's system add-on. r=mikedeboer. [Mark Banner]

* Bug 1223573 - Part 4. Build system changes for Loop as a system add-on. r=mikedeboer,r=glandium. [Mark Banner]

* Bug 1223573 - Part 3. Move browser-loop.js to begin forming bootstrap.js. r=mikedeboer. [Mark Banner]

* Bug 1223573 - Part 2. Move prefs and css into the new Loop system add-on. r=mikedeboer. [Mark Banner]

* Bug 1223573 - Part 1. Move loop to browser/extensions/loop. r=mikedeboer. [Mark Banner]

* Bug 1227885 - Improve stubbing of audio requests to avoid intermittent console warnings and also improve caught errors output. r=mikedeboer. [Mark Banner]

* Bug 1228053.  syncThenable in loop test code should have catch(), since some of the tests assume that Promise instances have a catch() method.  r=mdeboer. [Boris Zbarsky]

* Bug 1214214 - Update style of sharing notifications bar, and make it persistent. r=mikedeboer. [Manuel Casas]

* Bug 1219005 - Open a new tab with the room context when joining an existing room. r=mikedeboer. [Manuel Casas]

* Bug 1227526: Wait for the feedback page to be opened, before closing the window. r=Standard8. [Mike de Boer]

* Bug 1225189 - Disable Hello for e10s windows. r=mikedeboer. [Manuel Casas]

* Bug 1225652 - Loop's unit tests should check for uncaught errors as well as uncaught warnings. r=mikedeboer. [Mark Banner]

* Bug 1216791 - Change the tooltip of the Hello icon in the toolbar. r=mikedeboer. [Manuel Casas Barrado]

* Bug 1227109. Tidy loop conversation window styles, remove temporarily work arounds that are no longer required and fix layout of standalone UI when in narrow views. r=mikedeboer. [Mark Banner]

* Bug 1225054 - In room list, if a room name is too long and requires &quot;...&quot;, the &quot;...&quot; renders over the menu items of the pen menu. r=mikedeboer. [Manuel Casas]

* Bug 1226156 - Multiple requests and updates happening when opening a Loop room - make getAll handle multiple requests at a time. r=mikedeboer. [Mark Banner]

* No bug: Array.slice not supported by Chrome, which the link clicker doesn't like. Use Array.prototype.slice instead. rs=Standard8. [Mike de Boer]

* Bug 1048850 - Part 6: make sure our mochi tests don't depend on mozLoopAPI anymore and move relevant ones to xpcshell. r=Standard8. [Mike de Boer]

* Bug 1048850 - Part 5: ui-showcase adjustments to remove its dependency on navigator.mozLoop. r=Standard8. [Mike de Boer]

* Bug 1048850 - Part 4: update mocha tests and karma runs to not rely on mozLoop anymore. r=Standard8. [Mike de Boer]

* Bug 1048850 - Part 3: transition from the navigator.mozLoop API to the RemotePageManager API. r=Standard8. [Mike de Boer]

* Bug 1048850 - Part 1: add a client part that can be used to request data from the Loop API or subscribe to incoming push messages. r=Standard8. [Mike de Boer]

* Bug 1201902 - Add new feedback link to Loop's panel menu. r=Standard8. [David Critchley]

* Bug 1224556 - Default fallback icon for Loop's rooms with no context is no longer displayed. r=mikedeboer. [Mark Banner]

* Bug 1219600 - Add a fallback method for handling Hello room titles, r=Mardak. [David Critchley]

* Bug 1222034 - [LinkClicker] Letterbox should be grey when sharing tabs. r=dmose. [Fernando Campo]

* Bug 1222028 - Large favicon in hello panel for some websites. r=mikedeboer. [Manuel Casas Barrado [:mancas]]

* Bug 1223351 - Store a metrics event on the loop server if the data channel setup fails. r=Mardak. [Mark Banner]

* Bug 1210865 - Change how Loop's data channels are setup to cope with the newer SDK that doesn't allow setting them up until subscription is complete. r=dmose. [Mark Banner]

* Bug 1210865 - Update OpenTok library to version 2.6.8. r=dmose. [Mark Banner]

* Bug 1221732 - Long page titles wrap in the panel conversation list, ui-r=sevaan, r=dmose. [Fernando Campo]

* Bug 1147167-Upgrade React in Hello to 0.13.3, r=Standard8. [Dan Mosedale]

* Bug 1221168 - The pen menu item on a given conversation should say &quot;Delete&quot;, NOT &quot;Delete conversation&quot;. r=Standard8. [Manuel Casas]

* Bug 1213984 - Remove contacts code from Loop's backend. r=Standard8. [Manuel Casas]

* Bug 1220878-switch Hello from React.addons.classSet to classnames package, r=edilee,gerv. [Dan Mosedale]

* Bug 1222146-Allow test API server to be run on env-specified port, r=Mardak, NPOTB, DONTBUILD. [Dan Mosedale]

* Bug 1065714 - Right-click context menu should not be shown on Panel nor Conversation [r=Mardak] [Fernando Campo]

* Bug 1215487 - Fix Mozilla logo in Chrome for Loop Standalone [r=Mardak] [David Critchley]

* Bug 1213906-Change email invitation to fit new user journey, r=dmose. [Chris Rafuse]

* Bug 1219740 - Add Beta Ribbon back in to Hello, r=dmose. [David Critchley]

* Bug 1214590 - Remove Loop default Room name, r=dmose. [David Critchley]

* Bug 1215593 - Relayout the room title and context tile in text chat. r=Standard8. [Chris Rafuse]

* Bug 1210865 - Update OpenTok library to version 2.6.8. rs=dmose. [Mark Banner]

* Bug 1215322 - remove need for CSP unsafe-eval in Hello, r=Mardak. [Dan Mosedale]

* Bug 1212357 - Update the layout of the rooms list items for user journey. r=mikedeboer. [Manuel Casas]

* Bug 1213851 - test bustage fix when rebasing on bug 1214582 [r=Mardak] [David Critchley]

* Bug 1213851 - Display only active room when user enters room [r=Mardak] [David Critchley]

* Bug 1214582 - Adjust how room titles are displayed/managed in Loop's UI. r=Standard8. [Manuel Casas]

* Bug 1199815 - Replace Error Summary at bottom of Loop's ui-showcase with React Component. r=Standard8. [Fernando Campo]

* Bug 1205684 - Video Window height pushes down context and covers a part of it. r=mikedeboer. [Manuel Casas]

* Bug 1203802 - Websocket Frame Listener API for devtool Network Inspector - part 1 - WindowID added into WebSocketChannel, r=michal. [Andrea Marchesini]

* Bug 1218450 - The width of the tile shown on Loop's standalone when you're the only person in the room is wrong, giving a bad layout. r=Mardak. [Mark Banner]

* Bug 1216551 - Fix an issue with Loop's unit tests failing when no devices are installed, due to bad stubbing. r=Mardak. [Mark Banner]

* Bug 1218405 - Change Loop's standalone background for the visual refresh/latest designs. r=dmose. [Mark Banner]

* Bug 1205684 - Video Window height pushes down context and covers a part of it [r=mikedeboer] [Manuel Casas]

* Bug 1213336-Update Hello standalone npm version, r=Standard8, NPOTB DONTBUILD. [Dan Mosedale]

* Bug 1213848 - Change the Loop panel display when a user enters their own room to stop them entering other rooms [r=mikedeboer] [Ed Lee]

* Bug 1217369 - &quot;Welcome to ...&quot; has extra padding on Loop's standalone UI making it feel strange. r=mikedeboer,ui-review=sevaan. [Mark Banner]

* Bug 1217335 - Room context is no longer shown when loading the Loop standalone UI. r=Mardak. [Mark Banner]

* Bug 1215455 - eslint consistent-return [r=Standard8] [Ed Lee]

* Bug 1215455 - eslint react/jsx-curly-spacing [r=Standard8] [Ed Lee]

* Bug 1215455 - eslint space-in-parens [r=Standard8] [Ed Lee]

* Bug 1215455 - eslint operator-assignment [r=Standard8] [Ed Lee]

* Bug 1215455 - eslint space-before-function-paren [r=Standard8] [Ed Lee]

* Bug 1215455 - eslint space-before-blocks [r=Standard8] [Ed Lee]

* Bug 1215455 - eslint space-after-keywords [r=Standard8] [Ed Lee]

* Bug 1215455 - eslint object-curly-spacing [r=Standard8] [Ed Lee]

* Bug 1215455 - eslint array-bracket-spacing [r=Standard8] [Ed Lee]

* Bug 1215455 - eslint no-multi-spaces [r=Standard8] [Ed Lee]

* Bug 1215455 - Use eslint --fix to turn on additional rules [r=Standard8] [Ed Lee]

* Bug 1216368 - Fix the panel views in Loop's ui-showcase - fake-Mozloop was missing a return statement. r=Standard8. [David Critchley]

* Bug 1203159 - Rewrite DevTools resource URLs. r=ochameau. [J. Ryan Stinnett]

* Bug 1212079 - Removed contact scripts from index, r=dmose. [Chris Rafuse]

* Bug 1131542 - Loop button on toolbar needs different tooltips to explain colours/state. r=Standard8. [Manuel Casas]

* Bug 1210774 - Upgrade Loop's use of eslint (to 1.6.x) and eslint-plugin-react (to 3.5.x). r=Mardak NPOTB DONTBUILD. [Mark Banner]

* Bug 1209686 - Remove Standalone header from Loop, r=mardak. [David Critchley]

* Bug 1213855 - Remove direct call functionality from Loop's backend. r=mikedeboer. [Mark Banner]

* Bug 1213810 - Remove obsolete actions previously associated with direct calls. r=mikedeboer. [Mark Banner]

* Bug 1212361 - Re-arrange panel layout for user journey (put the button above the room list) [r=Standard8] [Ed Lee]

* Bug 1204812 - Keep Console.jsm in toolkit/modules/ r=jryans,Mossop. [Alexandre Poirot]

* Bug 1212340 - Move the Leave feedback option from the conversation window settings menu to the panel settings menu. r=Standard8. [Manuel Casas]

* Bug 1209589 - Collect Google Analytics data for users on IE 10 &amp; 11. r=Standard8. [Chris Rafuse]

* Bug 1212331 - Remove the Let's talk about context addition options from the Loop panel. r=Standard8. [Manuel Casas]

* Bug 1212338 - Move the user's &quot;availability&quot; option to the settings menu as a &quot;turn notifications on/off&quot; in the Loop panel. r=Standard8. [Manuel Casas]

* Bug 1201308 - Leave / Exit conversation button always present, r=dmose. [Chris Rafuse]

* Bug 1212083 - Part 2. Remove the unused files previously associated with direct calls. r=mikedeboer. [Mark Banner]

* Bug 1212083 - Part 1. Remove the direct calls UI from Loop. r=mikedeboer. [Mark Banner]

* Bug 1213213 - run-all-loop-tests.sh isn't catching all mochitest failures. r=mikedeboer. [Mark Banner]

* Bug 1212787 - Revert Loop's conversation toolbar button sizes due to bug 1209632 causing a visual regression. r=dmose. [Mark Banner]

* Bug 1212348 - Loop's RoomList view requires user profile data passed in when it doesn't need to. r=mikedeboer. [Mark Banner]

* Bug 1212074 - Update Mochitests for Loop now that the tabs are removed from the panel. r=mikedeboer. [Mark Banner]

* Bug 1212074 - Remove the tabs from Loop's panel. r=Standard8. [David Critchley]

* Bug 1200693 - Modify aspect ratio so that top and bottom black bars are not seen when waiting alone in the conversation window. r=Standard8. [Manuel Casas]

* Bug 1209632 - Removing footer from Loop Standalone, moved Logo to mediaLayoutView. r=Standard8,ui-review=Sevaan. [David Critchley]

* Bug 1202902 - Scripted fix the world. [Shu-yu Guo]

* Bug 1202902 - Fix the world. (r=ato for marionette, rs=Mossop for rest) [Shu-yu Guo]

* Bug 1212272 - 'make dist' for the Loop standalone doesn't update the css and supplementary files properly. r=dmose. NPOTB DONTBUILD. [Mark Banner]

* Bug 1211563 - Invite buttons should be underneath &quot;Invite a friend&quot; text in popped-out view [r=Standard8] [Ed Lee]

* Bug 1211592 - The Copy Link and Email Link buttons show cursor:default, but the other buttons (Camera,Mic,Share Screen,Settings) show cursor:pointer [rs=jaws] [Ed Lee]

* Bug 1208047 - Close the dropdown menu for sharing on Loop's conversation window as soon as an item is clicked, rather than leaving it open in a potentially confusing state. r=mikedeboer. [Mark Banner]

* Bug 1172662 - ICE failures occuring in Loop conversations should be reported to the user. r=Standard8. [Manuel Casas]

* Bug 1210707 - Feedback view no longer allows closing the window and avoiding leaving feedback. r=mikedeboer. [Mark Banner]

* Bug 1204345 - Last letter at bottom right can be cut off, r=dmose. [Chris Rafuse]

* Bug 1210513 - Loop's direct calls don't cancel properly if you click the hangup button on the toolbar. r=mikedeboer. [Mark Banner]

* Bug 1209592 - Fix Loop's screenshare dropdown being misplaced on large window sizes. r=mikedeboer. [Mark Banner]

* Bug 1204343 - Loop's accept call buttons has different heights and looks strange. r=mikedeboer. [Mark Banner]

* Bug 1207300 - If Firefox is started offline, then Loop never initialises correctly. r=dmose. [Mark Banner]

* Bug 1210331 - Clean up strings for conversations panel and conversation invite [r=Standard8] [Ed Lee]

* Bug 1184921: allow custom buttons to be added to the chatbox titlebar and implement one for Hello that closes the window when clicked. r=Standard8. [Mike de Boer]

* Bug 1184924 - Implement the refreshed design for the invitation overlay [r=Standard8] [Ed Lee]

* Bug 1155923 - Removing moz prefix from RTC interfaces, r=jesup,smaug. [Martin Thomson]

* No bug. Fix Loop's eslint configuration, due to fallout from bug 1203520. rs=dmose NPOTB DONTBUILD. [Mark Banner]

* Bug 1193674 - If room context/name is unavailable, the title of the standalone is displayed as &quot;{{roomName}} - Firefox Hello&quot;. r=Standard8. [Manuel Casas]

* Bug 1209029 - .settings-menu .icon classes in Loop's panel are obsolete and should be removed. r=Standard8. [Mark Banner]

* Bug 1205206 - Move Loop Standalone Terms of Service text from footer to under Join button. r=Standard8. [David Critchley]

* Bug 1202265 - Add visual regression tool for Hello, r=dmose. [Andrei Oprea]

* Bug 1204101 - Fix for Loop settings menu positioning where menu gets cropped from longer text, r=dmose. [David Critchley]

* Bug 1209620 - Fix intermittent failure finding the start a conversation button in Loop's functional tests. r=dmose NPOTB DONTBUILD. [Mark Banner]

* Bug 1206457 - Second attempt to fix intermittent failure in browser_LoopRooms_channel.js - ensure previous states are cleared when they are used. r=mikedeboer. [Mark Banner]

* Bug 1209078 - Part 2. If a user attempts to open their own room within Firefox when the room is already open, provide a message to inform the user. r=mikedeboer. [Mark Banner]

* Bug 1209078 - Part 1. When detecting if rooms are able to be handled by Firefox, also include an indication if they are already open or not. r=mikedeboer. [Mark Banner]

* Bug 1171962: introduce telemetry histogram that counts the amount of sessions that exchanged one or more chat messages. r=vladan,dmose. [Mike de Boer]

* Bug 1208647-minify OpenTok+lodash for faster Hello standalone load time, r=Standard8. [Dan Mosedale]

* Bug 1188509-Bundle Hello standalone JS for performance, r=Standard8. [Dan Mosedale]

* Bug 1208466 - Part 3. Fix display when opening room, and make the opened room text non-bold. r=mikedeboer. [Mark Banner]

* Bug 1208466 - Part 2. If an owner of a Loop link clicks their own link and join, make it open the conversation window. r=mikedeboer. [Mark Banner]

* Bug 1208466 - Part 1. Create a new ToS view for Loop's standalone, ready for integration into the handled-in-Firefox views. r=mikedeboer. [Mark Banner]

* Bug 1208515 - The feedback view has the incorrect blue for the Hello icon and button. r=dmose. [Mark Banner]

* Bug 1190738-Add Edit view with error to Hello ui-showcase, r=dmose. [David Critchley]

* Bug 1207575 - Fix reporting of Loop's connection status if a user exits a room and then re-enters it without reloading the room. r=Mardak. [Mark Banner]

* Bug 1208201 - Simplify setup flows for standalone and desktop in Loop's activeRoomStore. r=mikedeboer. [Mark Banner]

* Bug 1188771 - Inform users when they can't use the Hello service due to ToS compliance. r=mikedeboer. [Mark Banner]

* Bug 1192924: Expose the update URL formatting code a new UpdateUtils module. r=rstrong. [Dave Townsend]

* Bug 1205610 - Log the string associated with OT's UNABLE_TO_PUBLISH exception to help understand where it is coming from. r=Mardak. [Mark Banner]

* Bug 1192924: Expose the update URL formatting code a new UpdateUtils module. r=rstrong. [Dave Townsend]

* Bug 1206457 - Fix intermittent browser_LoopRooms_channel.js time out, set up the back channel earlier to avoid loading time/setup issues. r=mikedeboer. [Mark Banner]

* Bug 1199213 - Part 3. More cleanup of conversation related css after call-url code removal. r=mikedeboer. [Mark Banner]

* Bug 1199213 - Part 2. Remove the old css relating to standalone call-url handling from Loop. r=mikedeboer. [Mark Banner]

* Bug 912121 - Rewrite require / import to match source tree. rs=devtools. [J. Ryan Stinnett]

* Bug 1203298 - Room loading spinner should be vertically centered. r=Standard8. [Manuel Casas]

* Bug 1206701 - Fix the contact menu buttons on Loop's panel so that audio and video conversations can be selected properly. r=Mardak. [Mark Banner]

* Bug 1205658 - Hello Spinner Blue should match other blue elements in Hello [r=Standard8] [Ed Lee]

* Bug 1184940 - Implement the refreshed design for the edit context view [r=dmose] Additional patch for review comments. [Ed Lee]

* Bug 1184940 - Implement the refreshed design for the edit context view. r=dmose. [Ed Lee]

* Bug 1199120 - Overlapping buttons in conversation window [r=Standard8] [Ed Lee]

* Bug 1206457 - Skip browser_LoopRooms_channel.js on ASan e10s. [Phil Ringnalda]

* Bug 1205591 - Add a basic service channel implementation for listening to Loop's link clicker and opening rooms when requested. r=mikedeboer. [Mark Banner]

* Bug 1113350 - Re-enable running of browser_parseable_css.js in Loop's run test script aid, now that the test works again. rs=dmose. [Mark Banner]

* Bug 1200689-Style Hello 'Share' menu consistently with gear icon menu, r=dmose. [Chris Rafuse]

* Bug 1204577: remove invalid CSS properties from Loop/ Hello source files. r=Standard8. [Mike de Boer]

* Bug 1190738 - Merging Loop CSS for checkboxes, r=dmose. [David Critchley]

* Bug 1203281 - Fix crop on popup menu in contact list for Loop, r=dmose. [David Critchley]

* Bug 1199213 - Part 1. Remove the old standalone call-url handling code from Loop. r=mikedeboer. [Mark Banner]

* Bug 1202408 - Fix the hover colour of the camera icon in Loop's contact list. r=mikedeboer. [Mark Banner]

* Bug 1205368-Fix Hello ui-showcase scrolling regression, r=dmose. [Chris Rafuse]

* Bug 1202902 - Mass replace toplevel 'let' with 'var' in preparation for global lexical scope. (rs=jorendorff) [Shu-yu Guo]

* Bug 1203237 - Fix iFrame HTML tag scrollbars appearing in RTL mode, r=dmose. [Chris Rafuse]

* Bug 1203850 - Rename Loop's srcVideoObject and related variables/attributes to clarify they are about the media element, not just the video. rs=dmose. [Mark Banner]

* Bug 1201031 - Menu for conversation options in the panel should be under the arrow [r=andreio] [Ed Lee]

* Bug 1196499 - Update Loop empty state for no conversations. r=Standard8,ui-review=pau,ui-review=sevaan. [Andrei Oprea]

* Bug 1203529 - Bad display when starting an audio-only call to a contact. r=dmose. [Mark Banner]

* Bug 1203098 - Option to start an audio-only call to a contact is missing from the Loop contact menu. r=dmose. [Mark Banner]

* Bug 1077513 - Stop Loop's contacts display squashing the avatar when a contact has a long name. r=Mardak. [Mark Banner]

* Bug 1203052 - Loop's contact search no longer shows the &quot;no matching results&quot; view. r=dmose. [Mark Banner]

* Bug 1184933 - Part 2. Add the settings menu onto the failure view. r=Mardak. [Mark Banner]

* Bug 1184933 - Part 1. Implement the refreshed design for the failure view. r=Mardak. [Marina Rodriguez Iglesias]

* Bug 1202402 - Nothing shown on the standalone UI when a peer exits the room [r=Standard8] [Ed Lee]

* Bug 1198891 - Tab/Window Sharing icon should turn blue when sharing is active. r=Mardak. [Mark Banner]

* Bug 1201446 - Don't expose websocket reasons to the view code where we have a specific failure detail available. r=Mardak. [Mark Banner]

* Bug 1192372-Fixed width and height for Loop desktop dropdown panel, r=dmose. [Chris Rafuse]

* Bug 1194622 - Provide indication of loading when waiting for the room list [r=Standard8] [Ed Lee]

* Bug 1198841 - Brief message to invite someone to join when joining a room with someone already there [r=Standard8] [Ed Lee]

* Bug 1200201 - Remove the code for redirecting to the FxOS client from Loop standalone. r=dmose. [Mark Banner]

* Bug 1201031 - Menu for conversation options in the panel should be under the arrow [r=andreio] [Ed Lee]

* Bug 1186396 - Remove remaining references to JQuery from Loop. r=andreio,r=Standard8. [David Critchley]

* No bug. Remove obsolete jshint files from Loop's standalone as Loop now uses eslint. rs=mikedeboer over irc. NPOTB DONTBUILD. [Mark Banner]

* Bug 1196350 - Update contacts view for Loop panel. r=Standard8. [Andrei Oprea]

* Bug 1183642 - Implement context menu for Loop conversation entries. r=mdeboer. [Andrei Oprea]

* Bug 1199734 - Loop's ui-showcase doesn't need to load sdk - avoid errors loading TB.min.css. r=andreio. [Mark Banner]

* Bug 1178390 - Reduce warnings to zero in Loop's desktop-local test suite. r=mikedeboer/Standard8. [Fernando Rodriguez Sela]

* Bug 1126733 - Brief message appears when entering a standalone room that the user is the only person in the room [r=Standard8] [Ed Lee]

* Bug 1174702 - Fix unnecessary scroll on Windows while editing context. r=mikedeboer. [Mark Banner]

* Bug 1198421 - 'Welcome to ...' needs a bottom border on the Loop standalone UI. r=mikedeboer,ui-review=sevaan. [Mark Banner]

* Bug 1157646 - Stop passing the roomOwner parameter around everywhere in Loop's rooms. r=mikedeboer. [Mark Banner]

* Bug 1184917 - Implement the refreshed design for 'Edit' conversation toolbar button. r=mdeboer. [Marina Rodriguez Iglesias]

* Bug 1193666 - Fix surrounding colour of context tiles for Loop's text chat views. Also fix the fallback icon for context on desktop. r=mikedeboer. [Mark Banner]

* Bug 1197366 - Suppress 404 errors for missing CSS on Loop's conversation window and standalone UI. r=Standard8. [Adam Roach [:abr]]

* Bug 1193665 - Entering a conversation multiple times from link-clicker UI causes duplicated received text messages. r=mikedeboer. [Mark Banner]

* Bug 1197795 - Update Loop's library versions (eslint 1.2.1, sinon 1.16.1). r=mikedeboer. [Mark Banner]

* Bug 1185893 - abuse of bind(this) with add/removeEventListener r=gijs. [Nazim Can Altinova]

* Bug 1192740 - Adding New contacts parent component for contact list, contact add, contact edit and contact import views under Contacts tab. r=aoprea. [David Critchley]

* Bug 1197302 - Fix loop functional test; missed update of button location from bug 1183638. r=Standard8 NPOTB DONTBUILD. [Andrei Oprea]

* Bug 1195677 - Implement updated design of Gravatar permission request box [r=mikedeboer] [Ed Lee]

* Bug 1184559: forgot to push newly added files. rs=bustage. CLOSED TREE. [Mike de Boer]

* Bug 1189287 - Update the tooltip strings for the mute and unmute video buttons inside the Hello conversation toolbar. r=mikedeboer. [jahbrewski]

* Bug 1184559 - Implement the refreshed design for the conversation toolbar. r=Standard8,mikedeboer. [Marina Rodriguez Iglesias]

* Bug 1190442 - Visual refresh for Loop FTU panel. r=mdeboer. [Andrei Oprea]

* Bug 1196251 - Revert string change in Loop panel. rs=mdeboer. [Andrei Oprea]

* Bug 1183615 - Implement refreshed design for the contacts list. r=mdeboer. [Andrei Oprea]

* No Bug - correct comment to say 'browser', not 'tab'. rs=comment-only. DONTBUILD. [Mike de Boer]

* Bug 1183638 - Loop conversation list panel refresh. [Andrei Oprea]

* Bug 1194738 - Drop some obsolete pref handling from Loop, and some old room conversation styles. r=andreio. [Mark Banner]

* Bug 1184559 - Implement the refreshed design for the Loop conversation toolbar. r=Standard8. [Marina Rodriguez Iglesias]

* Bug 1193693 - Improve the Analytics filtering of Loop conversation urls. r=abr NPOTB so DONTBUILD. [Mark Banner]

* Bug 1191102 - Loop UI Showcase change from using &lt;Example&gt; to &lt;FramedExample&gt; r=andreio. [David Critchley]

* Bug 1157645 - Always send the room owner as &quot;-&quot; for Loop. r=Standard8. [Fernando Rodriguez Sela]

* Bug 1193765 - Share Link doesn't work from the user unavailable screen of direct calls. r-dmose. [Mark Banner]

* Bug 1193764 - Loop's Direct calls hang if the contact hasn't connected to the server at all. r=dmose. [Mark Banner]

* Bug 1191014 - Add google analytics event on tile clicks [r=dmose] [Ed Lee]

* Bug 1171925 - Allow the entire area of Loop's context to be clicked; don't show hover effects in the panel. r=dmose. [Mark Banner]

* Bug 1178393 - Countdown to zero warnings in standalone test suite. r=andreio. [Chris Rafuse]

* Bug 1193311 - Enable eslint rules for Loop: eqeqeq (for content code). r=dmose. [Mark Banner]

* Bug 1192738 - Drop the old aspect ratio calculation code now that Loop's media layout refactors have been completed. r=andreio. [Mark Banner]

* Bug 1183619 - add a new contact form visual refresh, ui-r=vicky, r=dmose. [David Critchley]

* Bug 1182079 - Fix intermittent test failure loading the Loop's ui-showcase on debug builds by extending the page load timeout, and improve the failure naming. r=andreio. [Mark Banner]

* Bug 1183618 - Implement refreshed design for the contacts list. [Andrei Oprea]

* Bug 1183386 - Update conversation tab headers for Loop panel. r=Standard8. [Marina Rodriguez Iglesias]

* Bug 1170757-Enabled eslint dot-location + no-empty rules for Hello, r=dmose. [Fernando R. Sela]

* Bug 1146312 - Display partner branding and ToS/PN links on the GetStarted only. r=Standard8. [Martin Tomes]

* Bug 1181991 - Change e-mail invitation text to improve CTR. r=andreio. [Chris Rafuse]

* Bug 1183617 - Implement updated design of contact buttons. [Andrei Oprea]

* Bug 1183636 - Implement refreshed design for Loop panel footer. [Andrei Oprea]

* Bug 1181987 - Display a tile when the link clicker is waiting alone in a conversation [r=dmose, f=mikedeboer] [Ed Lee]

* Bug 1190293 - Upgrade Loop's use of eslint to 1.0.x and the eslint-plugin-react to 3.2.x. r=andreio. [Mark Banner]

* Bug 1155402 - Change Loop's standalone prompt for gUM to align with Chrome 44 changes. r=Standard8 NPOTB DONTBUILD. [Tummala Dhanvi]

* Bug 1190298 - Make it easier to access Loop's code coverage. r=andreio NPOTB. [Mark Banner]

* Bug 1176280 - make links in Hello chat clickable, r=mikedeboer, r=gerv for license.html changes. [Dan Mosedale]

* Bug 1189838 - Fix test coverage for Loop, r=dmose. [Andrei Oprea]

* Bug 1183649 - Implement the refreshed design for the 'Start a new conversation' button. r=mikedeboer. [Marina Rodriguez Iglesias]

* Bug 1188547 - Small screen view stretches media prompt background [r=andreio] [Ed Lee]

* Bug 1125181 - Hello should put the conversation (aka room) name in the &lt;title&gt;. r=mikedeboer. [Marina Rodriguez Iglesias]

* Bug 1183884 - Change manual testing infrastructure. r=mikedeboer. [Andrei Oprea]

* Bug 1180179 - Part 4. Use the shared media layout component in Loop's room views. r=mikedeboer. [Mark Banner]

* Bug 1180179 - Part 3.1. Fix ui-showcase screen share standalone room views. r=mikedeboer. [Mark Banner]

* Bug 1180179 - Part 3. Use the shared media layout component in direct calls. r=mikedeboer. [Mark Banner]

* Bug 1185485: disable the Loop/ Hello button in private browsing mode. r=Standard8. [Mike de Boer]

* Bug 1187309 - Simplify the no-camera work around for Loop that was put in place when we didn't have device enumeration - avoid unnecessary exceptions from the sdk. r=mikedeboer. [Mark Banner]

* Bug 1186541 - Fix a warning in StandaloneRoomView.shouldRenderRemoteVideo when the roomState is gather. r=mikedeboer. [Mark Banner]

* Bug 1181825 - Enable eslint rules for Loop: no-extra-boolean cast, no-redeclare, r=dmose. [Fernando Rodriguez Sela]

* Bug 1180179 - Part 2. Create a new shared media layout component. r=mikedeboer. [Mark Banner]

* Bug 1186362 - Drop Loop's use of jQuery from the desktop UI. r=mikedeboer. [Mark Banner]

* Bug 1180700 - Fix wrapping of context information when comments field contains a long word. r=mikedeboer. [Mark Banner]

* Bug 1183178: follow-up to add BrowserTestUtils to ESLint known globals. rs=me. [Mike de Boer]

* Bug 1183178: use more robust e10s-friendly tab loading mechanism to fix intermittent test failures. r=Standard8. [Mike de Boer]

* Bug 1183187 - Aspect ratio of favicon in room context is sometimes wrong on the Loop standalone client. r=mikedeboer. [Mark Banner]

* Bug 1171415 - Implement NPS feedback form for Loop. r=mikedeboer. [Andrei Oprea]

* Bug 1171344 - Update in-content search UI tests. r=adw. [Nihanth Subramanya]

* Bug 1185465 - Improve doNotTrack checking documentation for Loop's standalone page. r=mikedeboer. [Mark Banner]

* Bug 1185454 - Fix eslint issue for Loop revealed in eslint 0.24.1, and upgrade the react plugin for eslint version to 2.7.1. r=mikedeboer. [Mark Banner]

* Bug 1182070 - Fix the layout of the text chat entries view on Loop's standalone UI when no entries are displayed. r=mikedeboer. [Mark Banner]

* Bug 1171344 - Update in-content search UI tests. r=adw. [Nihanth Subramanya]

* Bug 1183576 - Update chat styles. r=mikedeboer CLOSED TREE. [Marina Rodriguez]

* Bug 1183576 - Update chat styles. r=mdeboer. [Marina Rodriguez]

* Bug 1182040: upgrade TokBox SDK to 2.5.2 which fixes the Hello tab sharing feature. r=dmose. [Mike de Boer]

* Bug 1180603 - Text inside text bubbles should always be aligned according to the text direction. r=mikedeboer. [mai]

* Bug 1181580: move the context edit form into the media view to make it cover the video streams only, not the text chat area too in Hello conversation windows. r=dmose. [Mike de Boer]

* Bug1182115 - Bug 1182115 - Fix README.txt about react-tools version, r=dmose. [Fernando Rodríguez Sela]

* Bug 1117080 - Limit Loop conversations subject to 124 characters. r=Standard8. [Fernando Rodriguez Sela]

* Bug 1178391 - Fix all warnings in Loop shared test suite. r=Standard8. [Andrei Oprea]

* Bug 1180179 - Part 1. Adjust standalone layout ready for a central media layout component. r=dmose. [Mark Banner]

* Bug 1181239 - Enable eslint 'use strict' function rule for Loop's content code. r/rs=dmose. [Mark Banner]

* Bug 1110937 - Make Loop's link-clicker show the expired/invalid failure view before the user clicks join. r=mikedeboer. [Mark Banner]

* Bug 1180671 - Rename 'l10n' to 'mozL10n' in Loop's views.jsx to be more consistent with uses elsewhere. r=mikedeboer. [Mark Banner]

* Bug 1142520: add telemetry hooks for Hello context in conversation add and URL access actions. r=Standard8,vladan. [Mike de Boer]

* Bug 1127574: Part 2 - add telemetry hooks for Hello rooms creation and deletion actions. r=Standard8,vladan. [Mike de Boer]

* Bug 1127574: Part 1 - add telemetry hooks copy and email of room and direct call URLs. r=Standard8,vladan. [Mike de Boer]

* Bug 1171940: introduce unit tests for the new room context flows inside the Hello conversation window. r=Standard8. [Mike de Boer]

* Bug 1171940: update/ fix tests that my patches above have broken and lower the total amount of warnings generated by React in the console. r=Standard8. [Mike de Boer]

* Bug 1171940: introduce an 'Edit Context' button to the conversation toolbar inside the Hello conversation window. r=Standard8. [Mike de Boer]

* Bug 1171940: remove the mode-switching and have only one-mode Edit Context view inside the Hello conversation window. r=Standard8. [Mike de Boer]

* Bug 1171940: move the context display into the chat area inside the Hello conversation window. r=Standard8. [Mike de Boer]

* Bug 1178270 - Upgrade Loop's use of eslint to the latest (0.24) and upgrade the eslint-plugin-react version (0.6.2). r=dmose. [Mark Banner]

* Bug 1176774 - Upgrade Loop's libs to latest versions and add some more pre-minified ones for release. r=dmose. [Mark Banner]

* Bug 1178383: count the amount of warnings yielded for each test suite and throw an error when the count doesn't meet expectations. r=Standard8. [Mike de Boer]

* Bug 1176774 - Upgrade Loop's test libraries to latest versions. r=dmose. [Mark Banner]

* Bug 1173582-no longer need to ship/load SDK CSS &amp; related assets, r=Standard8. [Dan Mosedale]

* Bug 1177954 - Log sdk failure events to the server during Loop room activity. r=dmose. [Mark Banner]

* Bug 1168841 - Style text chat elements and add timestamps. r=Standard8. [Andrei Oprea]

* Bug 1171949 - Play a sound when a chat message is received for Loop. r=dmose. [Mark Banner]

* Bug 1176933 - Enable missing props validation elint rule checking for Loop. r=dmose. [Mark Banner]

* Bug 1176780 - Enable jsx-sort-props-types eslint rule for Loop. rs=dmose. [Mark Banner]

* Bug 1176778 - Enable jsx-sort-props eslint rule for Loop. rs=dmose. [Mark Banner]

* Bug 1176278 - Long strings in Loop's text chat cause the chat area to be horizontally scrollable. r=dmose. [Mark Banner]

* Bug 1168848 - Make TextChat style correctly when focussed. r=Standard8. [Dan Mosedale]

* Bug 1176277 - Loop's text chat entries view should take up the whole height of the text chat view, when the input box isn't shown. r=dmose. [Mark Banner]

* Bug 1176241 - Stop scrollbars being shown all the time on Loop's text chat areas. r=dmose. [Mark Banner]

* Bug 1171933-Reimplement spinners that Hello lost after markdown extraction, r=dmose. [Andrei Oprea]

* Bug 1169385 - Add referrer controls for Loop standalone page. r=dmose. [Mark Banner]

* Bug 1168851 - Text chat should be disabled when the other participant leaves the room. r=mikedeboer. [Mark Banner]

* Bug 1175825 - Fix text chat room name display when no room name is available (due to crypto failure) and fix a mozL10n warning on Loop desktop. r=mikedeboer. [Mark Banner]

* Bug 1168829 - Part 3. Fix some RTL issues associated with the new layout for Loop's text-chat. r=mikedeboer. [Mark Banner]

* Bug 1168829 - Part 2. Adjust Loop's Standalone UI to include text chat for conversations. r=mikedeboer. [Mark Banner]

* Bug 1168829 - Part 1. Remove Loop's standalone UI old dynamic layout and context views. r=mikedeboer. [Mark Banner]

* Bug 1175441 - Clear the 'Let's talk about' tickbox in the Loop panel when the page selection changes. r=mikedeboer. [Mark Banner]

* Bug 1175827 - Fix warning about 'shouldRenderRemoteVideo: unexpected roomState' when opening a Loop conversation on desktop - add missing states. r=mikedeboer. [Mark Banner]

* Bug 1149955 - Skip test_shared_all.py on Windows due to frequent failures. [Ryan VanderMeulen]

* Bug 1173909-Give loop showcase FramedExamples dashed borders and CSS style exclusion. [Dan Mosedale]

* Bug 1174945 - Enable eslint rule for no-shadow. r=dmose. [Andrei Oprea]

* Bug 1174611: check if the component is still mounted when the tab metadata has been retrieved inside the Loop panel. r=Standard8. [Mike de Boer]

* Bug 1175102: generalize lost callback detection and reporting for async MozLoopAPI functions. r=Standard8. [Mike de Boer]

* Bug 1174714 - Part 3. Display room context information in the Loop standalone UI text chat area. r=dmose. [Mark Banner]

* Bug 1174714 - Part 2. Display the room name at the start of the text chat view in the Loop Standalone UI. r=dmose. [Mark Banner]

* Bug 1174714 - Part 1. Drop obsolete box shadows in Loop's css. r=dmose. [Mark Banner]

* Bug 1168833: introduce different sizing modes to docked social chat windows and re-style text chat UI indide the Hello conversation window. r=Standard8. [Mike de Boer]

* Bug 1164510: show a globe favicon as default when no favicon can be found for a Hello context in conversation. r=Standard8. [Mike de Boer]

* Bug 1164510: show a globe favicon as default when no favicon can be found for a Hello context in conversation. r=Standard8. [Mike de Boer]

* Bug 1119000 - Improve the layout of Loop's standalone footer - reduce the height it takes up. r=mikedeboer,ui-review=sevaan. [Mark Banner]

* Bug 1170627 - close the context edit form upon a successful save action inside a Hello conversation window. r=Standard8. [Mike de Boer]

* Bug 1173036 - Change Loop's RTL attributes to be consistently set on the html element. r=mikedeboer. [Mark Banner]

* Bug 1172768 - Loop's desktop plural form handling doesn't handle zeros very well. r=mikedeboer. [Mark Banner]

* Bug 1170627: close the context edit form upon a successful save action inside a Hello conversation window. r=Standard8. [Mike de Boer]

* Bug 1164510: show a globe favicon as default when no favicon can be found for a Hello context in conversation. r=Standard8. [Mike de Boer]

* Bug 1172141 - Use the maxLogLevelPref ConsoleAPI option for Loop and UITour to make logging preferences live. r=bgrins. [Matthew Noorenberghe]

* Bug 1141296-make Loop use its own markup, not the SDK's, r=Standard8. [Dan Mosedale]

* Bug 1170535: anchor the social share panel to the Hello button whilst sharing a room URL and enable the Social Provider Activation panel in release. r=mixedpuppy,Standard8. [Mike de Boer]

* Bug 1165281 - Fix Loop no-spaced-func ESlint rules. r=Standard8. [Aaron Raimist]

* Bug 1165281 - Fix Loop no-wrap-func ESlint rules. r=Standard8. [Aaron Raimist]

* Bug 1165281 - Fix Loop key-spacing ESlint rules. r=Standard8. [Aaron Raimist]

* Bug 1170051 - Fix issues with screen shares not correctly laying out on Loop standalone UI - remove the video dimensions from the cache when the share is stopped. r=mikedeboer. [Mark Banner]

* Bug 1169908 - Add a robots.txt for Loop's standalone UI. r=mikedeboer. [Mark Banner]

* Bug 1169706 - Link-clicker UI broken for release builds (38 &amp; earlier) - Join doesn't work (TypeError: rootNavigator.mediaDevices.enumerateDevices is not a function). r=dmose. [Mark Banner]

* Bug 1151528 - Add optimizely to Loop standalone for research and optimization purposes. Also tidy up some of the in-line javascript in the index page. r=mikedeboer DONTBUILD NPOTB. [Mark Banner]

* Bug 1162909: follow-up to revert the accidental hard-coding of dir='rtl' inside Hello conversation windows. rs=me. DONTBUILD. [Mike de Boer]

* Bug 1162909: update the context views inside the Hello conversation window with latest UX updates. Make saving context data always work and more resilient to failure. r=Standard8. [Mike de Boer]

* Bug 1168788 - Check for devices should check for audio or video not just audio. r=mikedeboer. [Mark Banner]

* Bug 1168366 - Loop Link-clicker: Joining a room, giving feedback, looses context information until the page is reloaded. r=mikedeboer. [Mark Banner]

* Bug 1168564 - Fix some general RTL issues in the Loop panel and conversation window. r=mikedeboer. [Mark Banner]

* Bug 1089102 - Make the Loop settings menu be displayed properly in the panel for rtl locales. r=mikedeboer. [Mark Banner]

* Bug 1166646: WINDOW_ENABLED telemetry key is falsy, thus not working. Check for its type properly. r=Standard8. [Mike de Boer]

* Bug 1168333 - Not having any devices has regressed to being notified as 'Something went wrong' on desktop. r=mikedeboer. [Mark Banner]

* Bug 1155170 - Add favicon to Hello link clicker page. r=dmose NPOTB DONTBUILD. [Mark Banner]

* Bug 1162444 - Ensure we update the context urls and description when we receive an update for an open room. r=mikedeboer. [Mark Banner]

* Bug 1160771 - Clean unnecessary tags and properties from SVG files in browser/ and toolkit/. r=dao. [Miles Richardson]

* Bug 1162991 - Implement an initial layer of text chat for Loop conversations. r=mikedeboer. [Mark Banner]

* Bug 1165287 - Don't remove the context data when hiding the Loop panel to try and avoid glitches/flickering in the display when it opens. r=mikedeboer. [Mark Banner]

* Bug 1157712 - Fix multiple OS X notifications when someone joins a Loop room. Ensure we don't attempt to re-initialise twice. r=mikedeboer. [Mark Banner]

* Bug 1118523 - Don't show the window will close message on the feedback received view on the Loop standalone UI. r=mikedeboer. [Mark Banner]

* Bug 1160501 - Enable eslint rules for Loop: quote related issues. r=Standard8. [Martin Tomes]

* Bug 1166720 - Gather some more metrics about where Loop link-clickers don't manage to get all the way to a connected conversation. r=mikedeboer. [Mark Banner]

* Bug 1165266 - Upgrade Loop's use of eslint to version 0.21.x and eslint-react-plugin to 2.3.x and enable no-undef rule. r=dmose. [Mark Banner]

* Bug 1160656-Separate MediaSetupMixin caches on different instances, r=mikedeboer. [Dan Mosedale]

* Bug 1143827 - remove default stun server. r=abr,bsmedberg. [Nils Ohlmeier [:drno]]

* Bug 1164821 - Remove previous workarounds for not having FxA keys in LoopRooms - remove old code to cope with unencrypted rooms. r=mikedeboer. [Mark Banner]

* Bug 1152764 - Loop should encrypt room context information for rooms that aren't encrypted. r=mikedeboer. [Mark Banner]

* Bug 1154775 - Upgrade OpenTok library to v2.5.1. r=dmose. [Mark Banner]

* Bug 1165861 - Tidy up OSFile error handling in LoopRoomsCache. r=mikedeboer. [Mark Banner]

* Bug 1162905: UX refresh for the available context area in the Hello panel rooms list. r=Standard8. [Mike de Boer]

* Bug 1162903: add unit test coverage for favicons use in Loop conversation context data. r=Standard8. [Mike de Boer]

* Bug 1162903: use favicons as Loop conversation context thumbnails and store them as base64 encoded data-uris. r=Standard8. [Mike de Boer]

* Bug 1154275 - Remove ise() in favor of is(); r=Ms2ger. [Ehsan Akhgari]

* Bug 1118983 - Mozilla logo at bottom of Loop Standalone UI is incorrect. r=Standard8. [Aaron Raimist]

* Bug 1073940 - Add missing icon to loop contacts panel. Patch originally by Andrei, updated by Standard8. r=mikeboer. [Andrei Oprea]

* Bug 1142532: compose a different email for Loop room invites when context data is attached to it. r=Standard8. [Mike de Boer]

* Bug 1160496 - Enable eslint rules for Loop: General code format. r=Standard8. [Martin Tomes]

* Bug 1153788 - Part 2. Ask the user to re-sign in to Loop if they don't have encryption keys for FxA. r=mikedeboer. [Mark Banner]

* Bug 1156205: show a scrollbar in the social share dropdown list inside the Loop conversation window when the number of items exceeds the maximum height. r=Standard8. [Mike de Boer]

* Bug 1162442: add tooltips to the context edit and close buttons inside the Loop conversation window. r=Standard8. [Mike de Boer]

* Bug 1162646 - Enable eslint rules for Loop: no trailing spaces. r=dmose NPOTB DONTBUILD. [Mark Banner]

* Bug 1161926 - Standalone UI doesn't always show 'Something went wrong' if the network connection dies. Upgrade jquery due to not always properly catching errors from $.ajax. r=dmose CLOSED TREE. [Mark Banner]

* Bug 1142515: add unit test coverage for the editing of context data inside the Loop conversation view. r=Standard8. [Mike de Boer]

* Bug 1142515: implement updating a room with changed context information. r=Standard8. [Mike de Boer]

* Bug 1142515: add utils to compare simple objects to support Loop context in rooms. r=Standard8. [Mike de Boer]

* Bug 1142515: add a generic custom checkbox widget for Loop UI elements to use. r=Standard8. [Mike de Boer]

* Bug 1142515: rename the pref contextInConverations to contextInConverSations, fixing a typo. r=Standard8. [Mike de Boer]

* Bug 1161926 - Standalone UI doesn't always show 'Something went wrong' if the network connection dies. Upgrade jquery due to not always properly catching errors from $.ajax. r=dmose. [Mark Banner]

* Bug 1160489 - Enable eslint rules for Loop: comma related. r=Standard8. [Martin Tomes]

* Bug 1152761 - Fix intermittent failure fixes in test_looprooms.js. Ensure we wait for all conditions to complete before moving on. r=mikedeboer. [Mark Banner]

* Bug 1152761 - Add local storage for Loop's room keys in case recovery is required, and handle the recovery. r=mikedeboer. [Mark Banner]

* Bug 1151862 - Get the full list of Loop rooms on first notification if we haven't got it previously. r=mikedeboer. [Mark Banner]

* Bug 1151862 - Get the full list of Loop rooms on first notification if we haven't got it previously. r=mikedeboer. [Mark Banner]

* Bug 1160487 - Enable eslint rules for Loop: semi-colon related. r=Standard8. [Martin Tomes]

* Bug 1128979 - Improve usability of loop-client test server - allow tests to be loaded when in the github context; also allow the full server url to be specified, not just the port. r=dmose NPOTB DONTBUILD. [Mark Banner]

* Bug 1108088 - Get Loop's build-jsx working on Windows without the react version check working (for now). r=dmose NPOTB DONTBUILD. [Mark Banner]

* Bug 1153806 - Enable encryption of Loop room context data. r=mikedeboer. [Mark Banner]

* Bug 1160145 - Fix eslint warnings in Loop's xpcshell and mochitest files and turn on linting for them. r=dmose. [Mark Banner]

* Bug 1115365 - Update the import string in the Loop contact panel to explain it will be from Google. r=Standard8. [Cedric Raudin]

* Bug 1152761 - Add local storage for Loop's room keys in case recovery is required, and handle the recovery. r=mikedeboer. [Mark Banner]

* Bug 1152733: change the name of Loop/ Hello histograms that recently changed to be enumerated types. r=vladan. [Mike de Boer]

* Bug 1084296 - Add an ellipsis to Loop's &quot;Remove Contact&quot; menu item. r=Standard8. [Martin Tomes]

* Bug 1146305 - IDN links should be properly displayed in Hello rooms for context in conversations. r=mikedeboer. [Mark Banner]

* Bug 1158112 - Move the Loop modules into a sub-directory and prepare eslint for enabling more rules for Loop. r=dmose. [Mark Banner]

* Bug 1102219 - Part 5: Replace more `String.prototype.contains` with `String.prototype.includes` in chrome code. r=till. [Tooru Fujisawa]

* Bug 1102219 - Part 4: Replace `String.prototype.contains` with `String.prototype.includes` in chrome code. r=till. [ziyunfei]

* Bug 1159199 - Clicking the context indicator in the Loop panel should close the panel after opening the url. r=mikedeboer. [Mark Banner]

* Bug 1155078 - Only display domain name in the context part of the panel. r=mikedeboer. [Mark Banner]

* Bug 1137813 - Part 4. Don't log the cleanup event as the server doesn't accept it after the room has been left. r=mikedeboer. [Mark Banner]

* Bug 1158800 - Don't show errors for context in conversations on the standalone UI as they may force the user into an unnecessary re-obtaining of the URL. r=dmose. [Mark Banner]

* Bug 1137813 - Part 3. Add room connection status logging. r=mikedeboer. [Mark Banner]

* Bug 1137813 - Part 2. Stub dispatcher.dispatch globally in otSdkDriver_test.js to simplify tests. r=mikedeboer. [Mark Banner]

* Bug 1137813 - Part 1. Tidy up some event handler names in Loop's otSdkDriver. r=mikedeboer. [Mark Banner]

* Bug 1158725 - Share link button has stopped working in latest nightly. Pass the necessary props to the component. r=mikedeboer. [Mark Banner]

* Bug 1149964 - Fix an intermittent error in Loop's functional tests (media start time should be uninitialized) and wait for the content server before starting tests. r=dmose NPOTB DONTBUILD. [Mark Banner]

* Bug 1153788 - Part 1 Opportunistically obtain encryption keys for FxA for Loop conversations context. r=mikedeboer. [Mark Banner]

* Bug 1156201 - Reset the video dimensions cache when in initial room states to avoid issues with not correctly displaying video streams when a room is re-entered. r=mikedeboer. [Mark Banner]

* Bug 1132222 - Add more metrics reporting to the Loop standalone UI. r=dmose. [Mark Banner]

* Bug 1142587 - Implement indicators for context in conversations in the panel alongside room names. r=mikedeboer. [Mark Banner]

* Bug 1145541. r=mikedeboer. [Mark Banner]

* Bug 1142514: add tests for the context views in the Loop conversation window. r=Standard8. [Mike de Boer]

* Bug 1142514: show context information in the Loop conversation window. r=Standard8. [Mike de Boer]

* Bug 1079697 - Remove obsolete jshint messages in Loop code. r=Standard8. [Cedric Raudin]

* Bug 1155561: ignore body clicks on dropdown menu buttons, to make dropdowns in Loop windows toggle properly. r=Standard8. [Mike de Boer]

* Bug 1142563 - Clean up global scope pollution from browser-loop.js. r=dao. [Zach Miller]

* Bug 1152733: Convert all Loop keyed histograms to be enumerated types and opt-out, which helps reporting tremendously. r=vladan,dmose. [Mike de Boer]

* Bug 1154708 - Drop renaming conversations from the Loop panel. r=dmose. [Mark Banner]

* Bug 1154806 - Loop's ui-showcase has stopped scrolling since bug 1132301. r=mikedeboer. [Mark Banner]

* Bug 1153630 - Allow buttons in the Loop panel to be bigger if required as L10n needs. r=dmose. [Mark Banner]

* Bug 1154868-Log exceptions in bufferedUpdateVideo callbacks,r=mikedeboer. [Dan Mosedale]

* Bug 1154862-Add forgotten param to VideoDimensionsChanged action, r=mikedeboer. [Dan Mosedale]

* Bug 1155036-standalone display unusable at 640x500, r=mikedeboer. [Dan Mosedale]

* Bug 1152197: update share_button2 label to the updated share_button3 in the Loop conversation window. r=Standard8. [Mike de Boer]

* Bug 1142588 - Implement context in conversations display for Loop's standalone UI. r=mikedeboer. [Mark Banner]

* Bug 1153418 - Fix an issue on Loop's standalone where the remote and video alignment during screenshare is 10px out. r=dmose. [Mark Banner]

* No bug. Update Loop's run-all-loop-tests.sh to reference the new location of browser_UITour_loop.js. rs=mikedeboer over irc. NPOTB DONTBUILD. [Mark Banner]

* Bug 1142525 - Hook up the tab context view to the create room action so that context can actually be added to a room. r=mikedeboer. [Mark Banner]

* Bug 1142522 - Part 2 Hook up encryption for room contexts in guest mode. r=mikedeboer. [Mark Banner]

* Bug 1142522 - Part 1 Share utils and crypto content modules with chrome as well. r=Standard8. [Mike de Boer]

* Bug 1153534 - Remove old currSize parameter deletion now the loop-server no longer supplies it. r=mikedeboer. [Mark Banner]

* Bug 1152947 - Remove expiresIn from the create room message for Hello as the server has its own default. r=mikedeboer. [Mark Banner]

* Bug 1132301: Part 5 - add unit tests for the Social Sharing feature of Loop. r=Standard8. [Mike de Boer]

* Bug 1132301: Part 4 - add a Share Link button in the Loop conversation window to share a room URL via the Social API. r=Standard8. [Mike de Boer]

* Bug 1132301: Part 3 - hide the Loop dropdowns when the content window loses focus, so mouseLeave workarounds can be removed. r=Standard8. [Mike de Boer]

* Bug 1132301: Part 2 - add navigator.mozLoop methods to allow interaction between Loop and the Social API. r=Standard8,mixedpuppy. [Mike de Boer]

* Bug 1132301: Part 5 - add unit tests for the Social Sharing feature of Loop. r=Standard8. [Mike de Boer]

* Bug 1132301: Part 4 - add a Share Link button in the Loop conversation window to share a room URL via the Social API. r=Standard8. [Mike de Boer]

* Bug 1132301: Part 3 - hide the Loop dropdowns when the content window loses focus, so mouseLeave workarounds can be removed. r=Standard8. [Mike de Boer]

* Bug 1132301: Part 2 - add navigator.mozLoop methods to allow interaction between Loop and the Social API. r=Standard8,mixedpuppy. [Mike de Boer]

* Bug 1152391: appVersionInfo should use UpdateChannel.jsm to fetch update channel information. r=Standard8. [Mike de Boer]

* Bug 1136797 - For Loop standalone rename the brand website url to download firefox url and update the default. r=dmose. [Mark Banner]

* Bug 1152296 - Move roomStore.js from shared code to desktop specific code for Loop. r=mikedeboer. [Mark Banner]

* Bug 1152245 - Receiving a call whilst in private browsing or not browser windows open can stop any calls to contacts being made or received. r=mikedeboer. [Mark Banner]

* Bug 1151832 - Remove some old workarounds for loop-server - optional parameters are now respected for PATCH /rooms/{token} and the 'roomConnectionId' check no longer needs to fallback to 'id'. r=mikedeboer. [Mark Banner]

* Bug 1138941 - Display a better string when we've failed to obtain the camera and video devices for Loop. r=dmose. [Mark Banner]

* Bug 1150632 - Extend eslint to Loop's .jsm files. r=dmose. [Mark Banner]

* Bug 1150273 - Use eslint for the react files for Loop. r=dmose. [Mark Banner]

* Bug 1150501: change 'Share my Tabs' to 'Share your Tabs' in the Loop conversation window screen sharing dropdown. r=Standard8. [Mike de Boer]

* Bug 1150052: report exceptions that occur in MozLoop object APIs directly to the console, so we'll be able to recognize errors better. r=Standard8. [Mike de Boer]

* Bug 1114957: clean up event listeners in MozLoop when they are next called after the conversation window was closed. r=Standard8. [Mike de Boer]

* Bug 1146921: disable the window sharing dropdown item in Loop conversation windows on unsupported platforms. r=Standard8. [Mike de Boer]

* Bug 1146834: use Uint8Array's subarray when slice is not available in Loop content pages. r=Standard8. [Mike de Boer]

* Bug 999737-add ESLint to run-all-loop-tests; update docs, rs=Standard, DONTBUILD. [Dan Mosedale]

* Bug 1147609 - Make Loop's standalone UI work with roomName as an unecrypted parameter or as an encrypted part of context. r=mikedeboer. [Mark Banner]

* Bug 999737-bootstrap eslint for loop content JS, fix a found bug, rs=MattN. [Dan Mosedale]

* Bug 1105490 - Remove old ToS generation code from Loop Standalone. r-dmose,r=ted NPOTB DONTBUILD. [Mark Banner]

* Bug 1149137 - Make Loop's Marionette unit tests run in e10s mode. r=mikedeboer. [Mark Banner]

* Bug 1139586 - Attempt to fix intermittent failures in Loop's Marionette unit tests by extending the timeout. r=mikedeboer. [Mark Banner]

* Bug 1132301: add strings for th upcoming Social Sharing feature in Loop. r=Standard8. [Mike de Boer]

* Bug 1147375 - Don't fall over if roomName isn't supplied, let users continue to use Loop. r=mikedeboer. [Mark Banner]

* Bug 1114563 - Show the room name before the user enters the room. r=mikedeboer. [Mark Banner]

* Bug 1146929 - Remove support for the old style call hash based urls from the Loop standalone UI. r=mikedeboer. [Mark Banner]

* Bug 1134279 - Change Telemetry data producers to use the correct recording flags. r=vladan. [Alessio Placitelli]

* Bug 1147104 - Add running e10s based mochitests to run-all-loop-tests.sh to help catch Loop failures before they land. r=jaws NPOTB DONTBUILD. [Mark Banner]

* Bug 1142687 - Show context information for current page in the rooms view. r=standard8. [Jared Wein]

* Bug 1145819 - Fix loop Telemetry counting of direct calls, r=Standard8. [Dan Mosedale]

* Bug 1142687 - Show context information for current page in the rooms view. r=standard8. [Jared Wein]

* Bug 1135095: add telemetry for window and tab sharing triggers in Loop. r=Standard8,vladan. [Mike de Boer]

* Bug 1137843 - Loop client should not try to leave room that it fails to join. r=dmose. [Mark Banner]

* Bug 1123660 - add logging to Loop media connection telemetry, r=Standard8. [Dan Mosedale]

* Bug 1141133 - Implement encrypt/decrypt of context information ready for Loop's context in conversation work. r=mikedeboer. [Mark Banner]

* Bug 1145394 - Remove exec bit on js files (r=fabrice,gavin) [Bill McCloskey]

* Bug 1144780 - Replace gBrowser.selectedTab.linkedBrowser with gBrowser.selectedBrowser. r=dao. [Abdelrhman Ahmed]

* Bug 1144344. r=mikedeboer. [Mark Banner]

* Bug 1143298: show the correct amount of imported contacts in the Loop panel after the import has finished. r=Standard8. [Mike de Boer]

* Bug 1081079 - Use the DocumentTitleMixin for Loop in more places. r=jaws. [Mark Banner]

* Bug 1143629 - Contacts import incorrectly displays all forms of plural strings. r=mikedeboer. [Mark Banner]

* Bug 1142950 - Update Loop's vendor libraries for unit tests. r=mikedeboer. [Mark Banner]

* Bug 1132293 - Let reliers access derived encryption keys through FxAccountsOAuthClient. r=mhammond. [Ryan Kelly]

* Bug 1135045: add tests to confirm that the tab-sharing infoBar is working as expected under various conditions. r=Standard8. [Mike de Boer]

* Bug 1088672 - Part 8. Rewrite Loop's incoming call handling in the flux style. Update the ui-showcase. r=mikedeboer. [Mark Banner]

* Bug 1088672 - Part 7. Rewrite Loop's incoming call handling in the flux style. Remove the now redundant non-flux based code for incoming calls. r=mikedeboer. [Mark Banner]

* Bug 1088672 - Part 6. Rewrite Loop's incoming call handling in the flux style. Fix window titles for the incoming call view. r=mikedeboer. [Mark Banner]

* Bug 1088672 - Part 5. Rewrite Loop's incoming call handling in the flux style. Correct the Call failed view to show only what's needed for incoming calls. r=mikedeboer. [Mark Banner]

* Bug 1088672 - Part 4. Rewrite Loop's incoming call handling in the flux style. Put back alerts and make window unload be handled correctly. r=mikedeboer. [Mark Banner]

* Bug 1088672 - Part 3. Rewrite Loop's incoming call handling in the flux style. Get the accept and cancel buttons working again on the accept call view. r=mikedeboer. [Mark Banner]

* Bug 1088672 - Part 2. Rewrite Loop's incoming call handling in the flux style. Switch incoming calls to use flux based conversation store and get them working as far as the accept view. r=mikedeboer. [Mark Banner]

* Bug 1088672 - Part 1. Rewrite Loop's incoming call handling in the flux style. Rename some views for better naming. r=mikedeboer. [Mark Banner]

* Bug 1140313: enable the 'Share my Tabs' option for screensharing in Loop conversations. r=Standard8. [Mike de Boer]

* Bug 1141128: add a margin of 10px to the left side of the remote video stream in the Loop standalone client. r=Standard8. [Mike de Boer]

* Bug 1088006 - Hook up Loop's ui-showcase to unit tests so that we don't keep on breaking it, and so that it can possibly catch use of es6 errors. r=dmose. [Mark Banner]

* Bug 1140481 - Use the StoreMixin in some of the Loop conversation views. r=dmose CLOSED TREE. [Mark Banner]

* Bug 1140481 - Use the StoreMixin in some of the Loop conversation views. r=dmose. [Mark Banner]

* Bug 1141059: ignore attempts to share e10s tabs in a Hello conversation. r=Standard8. [Mike de Boer]

* Bug 1123660 - Add telemetry probes for measuring failed, short, medium, and long calls. Largely paired w/jaws, r=jaws,dmose,Standard8, a=bsmedberg for opt-out metric. [Dan Mosedale]

* Bug 1106941 - Part 2. Firefox Hello doesn't work properly when no video camera is installed - fix incoming conversations. r=mikedeboer. [Mark Banner]

* Bug 1140092 - Remove handling of guest calls from the Loop backend. r=mikedeboer. [Mark Banner]

* Bug 1141229-Improve Hello functional test logging DONTBUILD, NPOTB, r=drno. [Dan Mosedale]

* Bug 1106941 - Part 1. Firefox Hello doesn't work properly when no video camera is installed - fix rooms and outgoing conversations. r=mikedeboer. [Mark Banner]

* Bug 1139427 - Define file-based metadata in /browser/components. r=gavin. [Sebastian Hengst]

* Bug 1131568 - Update the OpenTok SDK to version 2.5.0. r=Standard8. [Mike de Boer]

* Bug 1139471 - Fix an issue with trying to update the Loop desktop room view's state whilst already rendering; This could cause items like tab sharing to still look like they were active even though they weren't. r=jaws. [Mark Banner]

* Bug 1109183 - Fix imports of the marionette client and remove spurious entry from sys.path provided by mach. r=ahal. [Chris Manchester]

* Bug 1131574 - In Loop's tab sharing, make the shared tab follow the active tab. r=mikedeboer. [Mark Banner]

* Bug 1094915: cleanup - remove preference clearing of Loop throttle prefs that are not used anymore. r=abr. [Mike de Boer]

* Bug 1137141: extend Loop toolbarbutton tests to check for correct panel states upon opening. r=Standard8. [Mike de Boer]

* Bug 1137141: fix for making the Loop contacts tab show and/ or hide when the user logs in or out of FxA. r=Standard8. [Mike de Boer]

* Bug 1137469 - If an uncaught exception occurs whilst processing an action, the dispatcher can fail, rendering parts of Loop inactive. r=mikedeboer. [Mark Banner]

* Bug 1069962: update ui-showcase to show contacts in the lists and add unit tests for Gravatar support. r=Standard8. [Mike de Boer]

* Bug 1069962: show a promo area in the contacts list for Gravatars. Show Gravatar icons upon granting permission. r=Standard8. [Mike de Boer]

* Bug 1110973 - Add a preference for enabling fake streams for tests, and use it in the Loop functional tests. r=smaug. [Mark Banner]

* Bug 967792 - Make localhost resolve offline. r=dragana. [Patrick McManus]

* Bug 967792 - make localhost resolve offline r=dragana. [Patrick McManus]

* Bug 1107336: Update loop tests to use new Marionette Driver; r=jgriffin. [David Burns]

* Bug 1133943: add necessary actions to start sharing a browser tab and pass respective parameters to the OpenTok SDK. r=Standard8. [Mike de Boer]

* Bug 1133493: add e10s-friendly API to fetch a tab's outer window ID. r=florian,Standard8. [Mike de Boer]

* Bug 1081847 - Resize the Loop conversation window to 300w x 272h. r=mikedeboer. [Mark Banner]

* Bug 1114713 - Fix intermittent test failures by removing a event-cycling setTimeout call. r=mikedeboer. [Mark Banner]

* Bug 1047040 - Add browser-specific graphic of GUM prompt to the media-wait message. r=dmose. [Jared Wein]

* Bug 1131584: add 'Share my Tabs' button to the screenshare dropdown menu in the conversation window. r=Standard8. [Mike de Boer]

* Bug 1113090: change Loop email to clarify that other browser are compatible. r=jaws. [Mike de Boer]

* Bug 1098517 - Fix hiding of FxA UI when loop.fxa.enabled is false; r=MattN. [Nithin Murali]

* Bug 1131581: move screensharing options into a dropdown anchored to the screenshare toolbar button. r=Standard8. [Mike de Boer]

* Bug 1126321 - Loop Standalone should display both of the remote video and screen when screen sharing is active. r=mikedeboer. [Mark Banner]

* Bug 1069962: fix the ui-showcase to load assets using relative paths. r=Standard8. [Mike de Boer]

* Bug 1099296 - Attach LoadInfo to remaining callers of ioService and ProtocolHandlers - websocket changes in browser/ (r=gavin) [Christoph Kerschbaumer]

* Bug 1132882 - Slave the local video size to the remote video width on the Loop standalone UI. r=mikedeboer. [Mark Banner]

* Bug 1126289 - Enable screen sharing for Loop link-generators by default. r=mikedeboer. [Mark Banner]

* Bug 1132064 - Local video is sometimes displayed in the wrong location on the standalone Loop UI. r=mikedeboer. [Mark Banner]

* Bug 1126286: update screenshare icon in conversation view toolbar. r=Standard8. [Mike de Boer]

* Bug 1121210: notify UITour when the active tab changes and don't show the get started info panel when the rooms tab is not selected. r=MattN. [Mike de Boer]

* Bug 1131688 - In the standalone view the conversation window we're currently overlaying the toolbar on top of the remote video. r=mikedeboer. [Mark Banner]

* Bug 1121210: notify UITour when the active tab changes and don't show the get started info panel when the rooms tab is not selected. r=MattN. [Mike de Boer]

* Bug 1126334 - Hello Icon should change colour when screensharing is active. r=jaws. [Mark Banner]

* Bug 1113896: toggle the Loop panel upon clicking the toolbar button. r=MattN. [Mike de Boer]

* Bug 1129507 - Honor DNT for Loop analytics. r=mikedeboer. [Adam Roach [:abr]]

* Bug 1115227 - Loop: add part of the UITour PageID to the Hello tour URLs as a query parameter. r=MattN. [Jared Wein]

* Bug 1045495 - Loop's link clicker UI needs new UX for notification of non supported platform. r=mikedeboer. [Mark Banner]

* Bug 1098355 - Change the functions in Loop's shared.utils.Helper to be accessible from the global state and avoid passing the helper down through the component props tree. r=mikedeboer. [Mark Banner]

* Bug 1122032 Part 2 - Show the Loop screenshare video in place of the remote video for now. r=mikedeboer. [Mark Banner]

* Bug 1122032 Part 1 - Setup minimal screen sharing for Loop from desktop (disabled by default). r=mikedeboer. [Mark Banner]

* Bug 1115227 - Loop: add part of the UITour PageID to the Hello tour URLs as a query parameter. r=MattN. [Jared Wein]

* Bug 1128471 - Link-clicker fails to work for FxOS standalone room joins (TypeError: newDimensions is not an object). r=mikedeboer. [Mark Banner]

* Bug 1127557 - Invalid preference type getting/setting loop.ot.guid. rs=jaws. [Mark Banner]

* Bug 1093780 Part 4 - Fix the audio-only display of avatars for the new sdk. r=mikedeboer. [Mark Banner]

* Bug 1093780 Part 3 - add tests for contain mode functionality in the MediaSetup mixin. r=Standard8. [Mike de Boer]

* Bug 1093780 Part 2 - Add support for using 'contain' mode for all video streams Loop publishes and resize/ position the elements based on their aspect ratio. r=Standard8. [Mike de Boer]

* Bug 1093780 Part 1 - Update OpenTok library to v2.4.0 for Loop. r=dmose. [Mark Banner]

* Bug 1127523 - Allow functional tests to be run against any loop-server. r=dmose NPOTB DONTBUILD. [Mark Banner]

* Bug 1066166 - Add localized tooltip captions for each tab button on the Loop panel. r=jaws. [Mark Banner]

* Bug 1126699 - Functional tests incorrectly need the local servers running on a user's computer. r=NiKo NPOTB DONTBUILD. [Mark Banner]

* Bug 1126199 - Enable remote video status checking in Loop's functional test. r=dmose NPOTB DONTBUILD. [Mark Banner]

* Bug 1118393 - Cannot use {{num}} in rooms_list_current_conversations - Don't remove the num argument for plural forms, as its a valid possible value. r=jaws. [Mark Banner]

* Bug 1122486 - Upgrade Loop's use of Tokbox SDK 2.2.9.7 to fix issues with calls and rooms intermitently failing to connect. r=nperriault. [Mark Banner]

* Bug 1097852 - Add support for IE10 to l10n-gaia. r=dmose. [Jared Wein]

* Bug 1125775 - Add information about the front-end unit tests and ui-showcase to Loop's README.txt. DONTBUILD as NPOTB. r=nperriault. [Mark Banner]

* Bug 1106852 - Introducing StoreMixin for Loop. r=Standard8. [Nicolas Perriault]

* Bug 974904-Add Google Analytics snippet for Hello link-clicker side, r=jaws. [Dan Mosedale]

* Bug 1115126 Rework the Loop functional test to have better namings for rooms, and improve some timeout handling to fix intermittent failures. r=drno. This is a test that isn't run on tbpl so DONTBUILD as NPOTB. [Mark Banner]

* Bug 1098629 - Support the retry button on the error bar in more cases. r=pkerr. [Matthew Noorenberghe]

* Bug 1120003 Hoist Loop REST errnos and websocket reasons, patch=jaws,dmose r=Standard8. [Dan Mosedale]

* Bug 1121071 Part 1 - Remove old call url code from the Loop panel and related UI areas. r=mikedeboer. [Mark Banner]

* Bug 1104930 - Create a mixin for handling updating of the video container for various Loop conversation views. r=nperriault. [Mark Banner]

* Bug 1076764 - Added notifications for Loop contacts import. r=Standard8. [Nicolas Perriault]

* Bug 1108028: replace pushURL registered with LoopServer whenever PushServer does a re-assignment. r=dmose. [Paul Kerr [:pkerr]]

* Bug 1028869 - Part 2: xpcshell test updated with ping/restore. r=standard8. [Paul Kerr [:pkerr]]

* Bug 1028869 - Part 1: Add ping and ack operations to PushHandler. r=standard8. [Paul Kerr [:pkerr]]

* Bug 1108049 - Rename Loop panel iframe id to a more descriptive than just 'loop' (now 'loop-panel-iframe'). r=Standard8. [Vikram Jadhav]

* Bug 1120001-direct calls sometime say 'unavailable' rather than 'something went wrong'; patch=jaws,dmose; r=jaws,dmose. [Dan Mosedale]

* Bug 1079216 - Improve some strings on the Loop feedback form. r=nperriault. [Mark Banner]

* Bug 1119765 - Joining and Leaving a Loop room quickly can leave the room as full. Ensure we send the leave notification if we've already sent the join. r=mikedeboer. [Mark Banner]

* Bug 1120428 - No error/failure message if the websocket fails to connect for some reason. Add a null check when closing the socket. r=nperriault. [Mark Banner]

* Bug 1118061-add &quot;caller unavailable&quot; messages to Hello, r=jaws. [Dan Mosedale]

* Bug 1119485 - Link clicker UI no longer resets to the stat conversation view after giving feedback. r=nperriault. [Mark Banner]

* Bug 1118402-Close panel after sign-in/sign-up clicked to avoid user confusion, r=MattN. [Dan Mosedale]

* Bug 1114957: cleanup LoopRooms event listeners when the conversation window is closed. r=Niko. [Mike de Boer]

* Bug 1113613: Show the telefonica logo only on first use. r=NiKo` [Romain Gauthier]

* Bug 1117863 - Correct Loop's language fallback to use all of accept languages properly. r=mikedeboer. [Mark Banner]

* Bug 1102477: pass HAWK request errors through to content. r=Standard8. [Mike de Boer]

* Bug 1079227 - Loop feedback form should always allow comments. r=nperriault. [Mark Banner]

* Bug 1118246 - Loop should handle forceDisconnect events from the OT sdk. r=nperriault. [Mark Banner]

* Bug 1096399 - [Loop] Upgrade React to 0.12.2. r=Standard8. [Nicolas Perriault]

* Bug 1117138 - Move incoming call views from conversation.jsx to conversationViews.jsx. r=nperriault. [Mark Banner]

* Bug 1058038 - Improve Marionette failure notices for frontend tests when the test fails to find &quot;Complete&quot;. r=cmanchester. [Mark Banner]

* Bug 1000085 - panel.css and contacts.css should move to a non-shared directory. r=mikedeboer. [Mark Banner]

* Bug 1115186: prevent network connections during loop module tests. r=MattN. [Paul Kerr [:pkerr]]

* Bug 1055145 - Part 2: Fix failing loop tests: prevent spurious network access attempts r=mattn. [Paul Kerr [:pkerr]]

* Bug 1114822 - Add an option to specify the location of the standalone server. r=dmose. [Nils Ohlmeier [:drno]]

* Bug 1076650: retry registration on a 401 response. r=mikedeboer. [Paul Kerr [:pkerr]]

* Bug 1110155 - Fixed renamed Loop room not reflected into the panel. r=Standard8. [Nicolas Perriault]

* Bug 1113574 - Check that the room &lt;chatbox&gt; is still open before resuming the tour from a join notification. r=dmose,markh. [Matthew Noorenberghe]

* Bug 1109849 - Bypass the feedback form if no-one has entered the room yet. r=nperriault. [Romain Gauthier]

* Bug 1104279 - Part 2: Add sequence verification to logInToFxa test. r=dmose. [Paul Kerr [:pkerr]]

* Bug 1055145: Remove push server fallback from Loop Client. r=abr. [Paul Kerr [:pkerr]]

* Bug 1113739 - Make sure loop.gettingStarted.resumeOnFirstJoin is true before resuming the Hello tour. r=dolske. [Matthew Noorenberghe]

* Bug 1112264-Hide loop self-view with message if it would be incompletely shown, r=NiKo. [Dan Mosedale]

* Bug 1110155 - Added minimal Loop room name validation. r=mikedeboer. [Nicolas Perriault]

* Bug 1109073 - Ensure a Loop room entry is highlighted when opened. r=mikedeboer. [Nicolas Perriault]

* Bug 1105708 - More l10n compliant buttons for Loop. r=mikedeboer. [Nicolas Perriault]

* Bug 1104279 Direct FxA Hello calls don't connect after you log in. Avoid registering with the loop server before we've finished fxa registration. r=pkerr. [Mark Banner]

* Bug 1112021 - Remove drop shadows on Loop video elements. r=Standard8. [Nicolas Perriault]

* Bug 1113346-update loop test runner script, rs=MattN, NPOTB, DONTBUILD. [Dan Mosedale]

* Bug 1097703 - Enable install/open FxOS Loop client from standalone UI for ROOM. r=mbanner. [Carmen Jimenez]

* Bug 1109032 - Fix the activity so audio only calls from received links work. r=mbanner. [Carmen Jimenez]

* Bug 1109149 - Display a basic error to the user if Loop room creation fails. r=nperriault. [Mark Banner]

* Bug 1112565 - Close the Loop panel when opening the getting started tour. rs=dolske. [Matthew Noorenberghe]

* Bug 1080953 - UITour: tell page when first incoming call is received and if that room window is open. r=dmose,dolske. [Matthew Noorenberghe]

* Bug 1080948: UITour: tell the page when a URL is copied or emailed. r=MattN,dmose. [Mike de Boer]

* Bug 1105525 - Enlarge Loop room rename field to prevent l10n issues. r=Standard8. [Nicolas Perriault]

* Bug 1102432: refresh the list of rooms upon account switch or logout. r=Niko. [Mike de Boer]

* Bug 1109950-speed up loop run-all-browser-tests by ~20 seconds, r=Standard8. [Dan Mosedale]

* Bug 1100595 - Add UI for indicating if renaming a room failed. r=NiKo` [Jared Wein]

* Bug 1107655 - Show the ToS/Privacy display in the Loop panel whenever Get Started is displayed. r=nperriault. [Romain Gauthier]

* Bug 1109325 - Change the help url for Hello's standalone rooms. r=nperriault. [Romain Gauthier]

* Bug 1097862 - Perform the leave notification to the loop-server in a synchronous fashion to give the notification more change of succeeding. r=nperriault. [Mark Banner]

* Bug 1111560 - Upgrade Loop's use of sinon to version 1.12.2. r=nperriault. [Mark Banner]

* Bug 1095303 - Update the test case to the new Rooms UI. r=dmose. [Nils Ohlmeier [:drno]]

* Bug 1097743 - Improved Loop standalone UI/X on smaller screens. r=dmose. [Nicolas Perriault]

* Bug 1109923 - Fix the Loop panel views in the ui-showcase. r=nperriault. [Mark Banner]

* Bug 1111011-loop panel should close on 'Start a Conversation' click, r=MattN. [Dan Mosedale]

* Bug 1101378 - self-image can be cropped, meaning the user doesn't see the entire sent images, r=NiKo` [Dan Mosedale]

* Bug 1109511: listen for the 'delete' event to update the toolbar icon when a room is deleted. r=Niko. [Mike de Boer]

* Bug 1106991 - Added missing icon for Hello's &quot;tour&quot;. r=nperriault. [Romain Gauthier]

* Bug 1104927 - UITour: Add Loop conversation view target for email/copy link buttons. r=Unfocused,mixedpuppy. [Matthew Noorenberghe]

* Bug 1107836 - Allow the local video and audio to be muted whilst in the invitiation view for Loop's rooms. r=nperriault. [Mark Banner]

* Bug 1103908 - Handle unicode room names properly for Loop. r=mikedeboer. [Mark Banner]

* Bug 1102170 - Share a room url by email when Loop direct call fails. r=Standard8. [Nicolas Perriault]

* Bug 1102437: make sure only push updates for the appropriate channel are processed. r=Standard8. [Mike de Boer]

* Bug 1106010: make sure enough UI elements are always visible when not signed in to FxA. r=Niko. [Mike de Boer]

* Bug 1107255-Fix tested Loop callers of window.close to use WindowCloseMixin, r=NiKo` [Dan Mosedale]

* Bug 1107255 - Close panel on call conversation start, r=:NiKo` [Dan Mosedale]

* Bug 1045498 - New Hello UX for non supported browsers. r=nperriault. [Romain Gauthier]

* Bug 1092954: add tests for forced disconnect handling on room deletion. r=Standard8. [Mike de Boer]

* Bug 1092954: oust all users from a room when it's deleted. r=Standard8. [Mike de Boer]

* Bug 1080947 - UITour: Tell the page when a Hello chat window opens or closes. r=Standard8,Unfocused,jaws. [Matthew Noorenberghe]

* Bug 1107210 - Fixed room name update not correctly reflected in Loop panel. r=Standard8. [Nicolas Perriault]

* Bug 1104921 - UITour: Add Loop panel targets. r=Unfocused. [Matthew Noorenberghe]

* Bug 1105802 - Added beta tag to standalone room layout. r=dmose. [Nicolas Perriault]

* Bug 1105809 - Centered feedback form in Loop standalone ended room conversation view. r=Standard8. [Nicolas Perriault]

* Bug 1105698 - Fixed brief flickering of feedback form in Loop standalone. r=Standard8. [Nicolas Perriault]

* Bug 1104921 - UITour: Add Loop panel targets. r=Unfocused. [Matthew Noorenberghe]

* Bug 1106538 - When deleting a room, the room is not removed from the conversation list - add a notification of the delete completing for the views to be informed. r=nperriault. [Mark Banner]

* Bug 1106934 Opening a Loop room can show an unexpected error due to race conditions. r=nperriault. [Mark Banner]

* Bug 1100378 - Retry button for Hello standalone. r=nperriault. [Romain Gauthier]

* Bug 1106474 - Drop conversationStore's use of Backbone.Model for Loop. r=nperriault. [Mark Banner]

* Bug 1064218 - Detect syntax failures in Loop's unit tests. r=nperriault. [Mark Banner]

* Bug 1080943 - Leak fix for 5994d92115ac copied from Loop's head.js. rs=bustage. [Matthew Noorenberghe]

* Bug 1092953: update the room delete button test to take the confirm dialog into account. r=Standard8. [Mike de Boer]

* Bug 1092953: show a modal confirm dialog when a user attempts to delete a room. r=paolo. [Mike de Boer]

* Bug 1090173 - Allow to rename a room from Loop panel. [Nicolas Perriault]

* Bug 1087528 - Call IDs in about:webrtc. r=standard8, r=pkerr. [Romain Gauthier]

* Bug 1074667: Generate system alert when someone joins a room. r=MattN. [Mike de Boer]

* Bug 1105520 - Open Loop room conversation window right after it's created. r=mikedeboer. [Nicolas Perriault]

* Bug 1098540 - Muting local video should display the default avatar image in Loop Rooms. r=nperriault. [Mark Banner]

* Bug 1105540 - Show tooltips for buttons 'Copy Link' and 'Delete conversation'. r=mikedeboer. [Mark Banner]

* Bug 1105537 - Add string in prepartion for upcoming Loop improvements. r=MattN. [Mark Banner]

* Bug 1105488 Update Privacy and ToS URLs for Loop. r=jaws. [Mark Banner]

* Bug 1079225 - Feedback form displayed for Loop standalone rooms. r=Standard8. [Nicolas Perriault]

* Bug 1103156 - Improve MozLoopAPI error messages. r=Standard8. [Adam Roach [:abr]]

* Bug 1089722 Handle Loop rooms being deleted in the backend, and sending appropriate notifications. r=mikedeboer. [Mark Banner]

* Bug 1105347 If something goes wrong in a Loop room, ensure that devices are released and the room is left fully. r=nperriault. [Mark Banner]

* Bug 1100565 - Adjust margins and paddings to be uniform throughout the Loop/Hello panel. r=mikedeboer. [Jared Wein]

* Bug 1097749 - Standalone rooms should display the room name once the room has been joined. r=nperriault a=kwierso for the CLOSED TREE. [Mark Banner]

* Bug 1097742 - Part 2 Standalone Rooms shouldn't join the room until after user media has been accepted. r=abr. [Mark Banner]

* Bug 1093787 - Insert an additional view for Loop standalone calls to prompt the user to accept the microphone and camera permissions before starting the call. r=nperriault. [Mark Banner]

* Bug 1086512 - Added feedback form to Loop desktop room window. r=Standard8. [Nicolas Perriault]

* Bug 1076754 - Moved Loop feedback flow to Flux. r=Standard8. [Nicolas Perriault]

* Bug 1097746 - Add a link to Hello's SUMO page for standalone. r=Standard8. [Romain Gauthier]

* Bug 1059756 - Add a link to Loop's help page in the gear menu. r=MattN. [Romain Gauthier]

* Bug 1100284: use a more canonical window ID for chat windows. r=MattN,abr. [Mike de Boer]

* Bug 1102841: implement Cancel and Block a call for incoming direct calls r=abr. [Mike de Boer]

* Bug 1100284: use a more canonical window ID for chat windows. r=MattN,abr. [Mike de Boer]

* Bug 1099462 - Set the Getting Started URL for Loop. r=MattN. [Jared Wein]

* Bug 1101754 - Hide the rooms/contacts view until the Getting Started tour has been accessed or dismissed. r=mikedeboer. [Jared Wein]

* Bug 1074720 - Fix German locale for partner logo. r=mikedeboer. [Jared Wein]

* Bug 1096229 Adjust Loop server urls to include /v0 to avoid potential redirects. r=mikedeboer. [Mark Banner]

* Bug 1100284: use a more canonical window ID for chat windows. r=MattN. [Mike de Boer]

* Bug 1102230: fix CSS and JS errors that appear in the test log. r=MattN,Niko. [Mike de Boer]

* Bug 1102806: LoopCalls.jsm introduction forgot to include contacts blocking logic. r=Standard8. [Mike de Boer]

* Bug 1102146: remove trailing whitespace on newline. rs=whitespace. [Mike de Boer]

* Bug 1102146: reduce the amount of HAWK requests for rooms getAll. r=Standard8. [Mike de Boer]

* Bug 1102130 - Follow-up - fix sound names of files for Loop rooms. rs=abr over irc. [Mark Banner]

* Bug 1102193: simplify l10n code in MozLoopService. r=Niko. [Mike de Boer]

* Bug 1100764 - Contacts move up and down when hovering over them. r=mikedeboer. [Jared Wein]

* Bug 1102130 - New Loop rooms sound files missing from desktop. r=nperriault. [Mark Banner]

* Bug 1101494 Guest mode doesn't work for rooms on a fresh profile - handle late guest registration, and keep track of when rooms are created to know if to automatically register or not. r=MattN. [Mark Banner]

* Bug 1101494 Fix joining a room in guest mode. r=mikedeboer. [Mark Banner]

* Bug 1101006 - Refactor mozLoop.{get, set}LoopCharPref and mozLoop.{get, set}LoopBoolPref to mozLoop.{get, set}Pref that uses getPrefType. r=mikedeboer. [Jared Wein]

* Bug 1074932 - Desktop client user can access product tour from gears menu. r=MattN. [Jared Wein]

* Bug 1094137 - Create a common shared store creator for Loop. r=Standard8. [Nicolas Perriault]

* Bug 1088650 Add sounds for notifications when rooms are joined, left or if there are failures. r=nperriault. [Mark Banner]

* Bug 1000269 - Part 1: Reconfigure l10n directory structure for Loop standalone. r=Standard8. [Paul Kerr [:pkerr]]

* Bug 1084362 When a third-party enters a room, stop displaying the ToS and privacy links in the Loop panel. r=nperriault. [Mark Banner]

* Bug 1099495 - Use moz10n.get instead of the aliased '__' function for consistency with the other files. r=NiKo` [Jared Wein]

* Bug 1074720 - Display partner logo depending on the locale on first-time experience. r=mikedeboer. [Jared Wein]

* Bug 1083466 - Add a button to the Loop panel for the Getting Started tour. r=mikedeboer. [Jared Wein]

* Bug 1074694 - Allow rooms to be renamed from the conversation window. r=nperriault. [Mark Banner]

* Bug 1074681 - When Loop &quot;rooms&quot; are enabled, hide the old call url generation UI. r=mikedeboer. [Mark Banner]

* Bug 1074666 - Part 3 Play a sound when a participant joined a room. Updated by pkerr,r=Standard8. [Mike de Boer]

* Bug 1074666 - Part 2 Change the toolbar icon when participants join and leave. Updated by pkerr,r=Standard8. [Mike de Boer]

* Bug 1098251 - Allow a contact to be created with either a phone number or an email address. r=MattN. [Jared Wein]

* Bug 1097742 followup - add comma to fix syntax error. r=me. [Jared Wein]

* Bug 1097742 - Part 1 Handle access being denied to media, and prevent the sdk prompts from showing in Loop Rooms. r=nperriault. [Mark Banner]

* Bug 1097743 - Part 1: Loop standalone styling enhancements. r=Standard8. [Nicolas Perriault]

* Bug 1095379 - Separate push registrations by sessionType and prevent calling promiseRegisteredWithPushServer from outside of promiseRegisteredWithServers. r=Standard8. [Matthew Noorenberghe]

* Bug 1097733 - Enable Loop Rooms to be reused without reloading, by resetting the multiplex gum. r=nperriault. [Mark Banner]

* Bug 1074709 - Notify Loop room users when the room is full. r=Standard8. [Nicolas Perriault]

* Bug 1076794 Make Loop calls handle networkDisconnected events properly so that the correct messages get displayed. r=Standard8. [Andrei Oprea]

* Bug 1074707 - Add notifications when the room is empty on Loop standalone. r=Standard8. [Nicolas Perriault]

* Bug 1074693 - Loop desktop room preview to use fullscreen local videostream. r=Standard8. [Nicolas Perriault]

* Bug 1074702 - Part 2: Room views for Loop standalone. r=Standard8. [Nicolas Perriault]

* Bug 1074670 - Implement the Hello NotificationView's button (e.g. retry). r=pkerr. [Matthew Noorenberghe]

* Bug 1081322 - Add a phone number field to the Add/Edit Contact view. r=dmose. [Jared Wein]

* Bug 1074696 - Allow the user to copy and email Loop room urls from the room preview. r=nperriault. [Mark Banner]

* Bug 1085246 - Make browser_fxa_login.js ignore the load for the placeholder tab in openFxASettings. r=gavin, r=Mossop, a=me. [Matthew Noorenberghe]

* Bug 1074686 - Part 5 Hook up the active room store to the sdk for Loop rooms on desktop to enable audio and video in rooms. r=nperriault. [Mark Banner]

* Bug 1076767 - Add a spinner to the Import Contacts button whilst importing. r=jaws. [Paolo Amadini]

* Bug 1074686 - Part 4 Improve Loop conversation store registration to only register for actions when they need it, and change PeerHungupCall into RemotePeerDisconnected to fit better with what it is for. r=nperriault. [Mark Banner]

* Bug 1074686 - Part 3 Revamped view architecture for Desktop Loop rooms. r=Standard8. [Nicolas Perriault]

* Bug 1074686 - Part 2: Implement room views for Loop Desktop. r=Standard8. [Nicolas Perriault]

* Bug 1093931 - Update Loop mocha unit test framework to v2.0.1, which supports Promises, r=Standard8. [Dan Mosedale]

* Bug 1074702 - Part 1 Implement join/refresh/leave with the Loop server on the standalone UI. r=nperriault. [Mark Banner]

* Bug 1073218: remove the soft start mechanism for full Hello rollout. r=abr,Unfocused. [Mike de Boer]

* Bug 1091537 - Set navigator.originalGum after the TB sdk has loaded in case TBPlugin was defined. r=dmose a=kwierso. [Jared Wein]

* Bug 1073415 - Add some polyfills for supporting IE for Loop's use of the l10n-gaia library and the TB SDK. r=dmose. [Jared Wein]

* Bug 1092587 - TypeError: Promise.defer is not a function, causing browser chrome failures. r=Yoric. [Joel Maher]

* Bug 1074688 - Part 3 Hook the new activeRoomStore into the standalone views, and also extend the store to manage joining rooms on the Loop server. r=nperriault,a=RyanVM. [Mark Banner]

* Bug 1074688 - Part 2 Add Join/Refresh/Leave room functions to the mozLoop API. r=mikedeboer. [Mark Banner]

* Bug 1065201: introduce new sounds for Hello standalone and desktop. r=mikedeboer. [Romain Gauthier]

* Bug 1093500 - Cleanup Loop registration by pulling push URLs from the push handler. r=pkerr. [Matthew Noorenberghe]

* Bug 1093793 - desktop call recipient declining incoming call leaves link-clicker's camera on. r=dmose. [Jared Wein]

* Bug 1094128 Convert the Loop Standalone controller app view to be based on the Flux style. r=nperriault. [Mark Banner]

* Bug 1093475 When a Loop call URL is deleted/blocked, use the proper session. r=mikedeboer. [Mark Banner]

* Bug 1093620 - Using a single root store for Loop rooms. r=Standard8. [Nicolas Perriault]

* Bug 1093056 Scrollbars shouldn't be shown in the room list by default. r=nperriault. [Mark Banner]

* Bug 1074688 - Part 1 Rename the existing EmptyRoomView to be DesktopRoomView, and clean it up, in preparation for the Loop room view implementation. r=nperriault. [Mark Banner]

* Bug 1073410 - get gUM perms earlier for Loop calls (paired with jaws), r=jaws,me. [Dan Mosedale]

* Bug 1074676 - Allow deleting a Loop room. r=Standard8. [Nicolas Perriault]

* Bug 1074666: add support for room updates, fix event dispatching and support room participant processing. r=Standard8. [Mike de Boer]

* Bug 1074678 - Open a room window when the user selects the room in the Loop panel. r=mikedeboer. [Mark Banner]

* Bug 1090209 - Part 2 Use MozLoopService to manage window ids centrally, and store the data for the window opening. r=mikedeboer. [Mark Banner]

* Bug 1090209 - Part 1 Drop the window type from the url that opens a Loop conversation window, and pass it in the call data instead. r=nperriault. [Mark Banner]

* Bug 1093027: stop using Promise.defer in Loop mochitests. r=Standard8. [Mike de Boer]

* Bug 1074680 - Create a Loop room, r=Standard8. [Nicolas Perriault]

* Bug 1075509 - Standalone UI needs &quot;call failed&quot; sound. r=nperriault. [Romain Gauthier]

* Bug 1077653 - Add incoming call button icon spacing. r=dmose. [Tomasz Kołodziejski]

* Bug 1091161 - MozLoopService: Separate gInitializeTimerFunc from the actual initialize callback so we can retry initialization on demand. r=pkerr. [Matthew Noorenberghe]

* Bug 1074674 - add button to copy room location to clipboard, r=NiKo. [Dan Mosedale]

* Bug 1089011: make sure to only import contacts that are part of the default contacts group. r=MattN. [Mike de Boer]

* Bug 1089547: fix error passing in MozLoopAPI and remove leftover in LoopRooms. r=Standard8. [Mike de Boer]

* Bug 1084228 Replace 'callId' with 'windowId' in a Loop conversation window so that it represents what it is and is distinct from the real 'callId'. r=mikedeboer. [Mark Banner]

* Bug 1089547: simplify LoopRooms implementation, add support for events. r=Standard8. [Mike de Boer]

* Bug 1078718 - Force standalone app reload on hashchange event. r=Standard8. [Andrei Oprea]

* Bug 1086434 Having multiple outgoing Loop windows in an end call state could result in being unable to received another call. r=dmose. [Mark Banner]

* Bug 1077610 - Remove unnecessary white space in loop's conversation window. r=mikedeboer. [Tomasz Kołodziejski]

* Bug 1089919 - Callback with an error if a 2nd registration for MozLoopPushHandler happens for the same channel ID. r=mikedeboer. [Matthew Noorenberghe]

* Bug 1074672 Part 3 - Update the Loop room list to use the new mozLoop.rooms API. r=Standard8. [Nicolas Perriault]

* Bug 1065203 - Add some sound notifications for Loop's standalone link-clicker ui. r=nperriault. [Romain Gauthier]

* Bug 1077599 - Rounding corners of buttons. r=mikedeboer. [Jared Wein]

* Bug 1088465 - MozLoopService: Use a |mocks| property instead of passing arguments through registration. r=mikedeboer. [Mike de Boer]

* Bug 1047410 - Desktop client should display Call Failed if an incoming call fails during set-up. r=nperriault. [Mark Banner]

* Bug 1088346 - Handle &quot;answered-elsewhere&quot; on incoming calls for desktop on Loop. r=nperriault. [Mark Banner]

* Bug 1074699 - Add createRoom and addCallback to LoopRooms API. r=dmose. [Paul Kerr]

* Bug 1077611 - Remove platform detection from loop panel &amp; conversation window. r=dmose. [Jared Wein]

* Bug 1088230 - Add backwards compatible registration payload to new rooms registration for Loop. r=Standard8. [Paul Kerr [:pkerr]]

* Bug 1069028 - Implement Loop panel footer layout/styling with FxA pieces. r=MattN. [Tomasz Kołodziejski]

* Bug 1074664: Implement a non-persistent rooms store, r=mikedeboer. [Paul Kerr]

* Bug 1033579 - Add channel to POST calls for Loop to allow different servers based on the channel. r=dmose. [Adam Roach [:abr]]

* Bug 1074663: Register with PushServer for updates to rooms, r=MattN. [Paul Kerr]

* Bug 1074517 Second call with a Loop url gets disconnected - ensure stream published/subscribed flags are properly reset. r=dmose. [Mark Banner]

* Bug 1081023 - Handle call url changes to the format for Loop's call links. r=nperriault. [Mark Banner]

* Bug 1081189 - Move URLs out of loop.en-us.properties and into the config file and Makefile. r=NiKo` [Jared Wein]

* Bug 1085451 - Implement new design for Loop's green call buttons. r=Gijs. [Jared Wein]

* Bug 1081959 - &quot;Something went wrong&quot; isn't displayed when the call fails in the connection phase, r=dmose. [Mark Banner]

* Bug 1084384: support alternate phone number values for Google import. r=abr. [Mike de Boer]

* Bug 1079941: implement LoopContacts.search to allow searching for contacts by query and use that to find out if a contact who's trying to call you is blocked. r=abr. [Mike de Boer]

* Bug 1079811 - A new call won't start if the outgoing call window is opened (showing feedback or retry/cancel). r=Standard8. [Romain Gauthier]

* Bug 1048162 Part 2 - Display an error message if fetching an email link fails r=standard8,darrin. [Nicolas Perriault]

* Bug 1081154 - Loop direct calls should attempt to call phone numbers as well as email addresses. r=mikedeboer. [Mark Banner]

* Bug 1048162 Part 1 - Add an 'Email Link' button to Loop desktop failed call view. r=Standard8. [Nicolas Perriault]

* Bug 1079941: implement LoopContacts.search to allow searching for contacts by query and use that to find out if a contact who's trying to call you is blocked. r=abr. [Mike de Boer]

* Bug 1082196 - Update imports in test files to reflect changes to mach's marionette script made in bug 1050511. r=dmose. [Chris Manchester]

* Bug 1082843.  Don't import Promise.jsm into the global scope in xpcshell tests.  r=yoric. [Boris Zbarsky]

* Bug 1078226 Unexpected Audio Level indicator on audio-only calls for Loop, also disable broken low-quality video warning indicator. r=nperriault. [Mark Banner]

* Bug 1081130: fix importing contacts with only a phone number and fetch the correct format. r=abr. [Mike de Boer]

* Bug 1081061: switch to a different database if a userProfile is active during the first mozLoop.contacts access to always be in sync with the correct state. r=MattN. [Mike de Boer]

* Bug 1074686 - Test/impl EmptyRoomView, store, and actions, r=Standard8. [Dan Mosedale]

* Bug 1076967: fix Error object data propagation to Loop content pages. r=bholley. [Mike de Boer]

* Bug 1079656 - Make the Loop Account menu item work after a restart. r=jaws. [Matthew Noorenberghe]

* Bug 1077518 Standalone link clicker UI needs a beta tag. r=dmose. [Mark Banner]

* Bug 1081029 - Standalone link clicker call state in the page title (tab name). r=dmose. [Jared Wein]

* Bug 1081066 Incoming call window stays open forever if the caller closes the window/tab or crashes. r=nperriault. [Mark Banner]

* Bug 1081095 - Fix a couple of issues on the standalone start page with Firefox Hello information. r=Standard8. [Jared Wein]

* Bug 1080476 - Upgrade React to 0.11.2. r=mikedeboer. [Nicolas Perriault]

* Bug 1074672 Part 2 - Loop Rooms tab icon should reuse the Call tab icon. r=Standard8. [Nicolas Perriault]

* Bug 1029433 When in a Loop call, the title bar should display the remote party's information. r=nperriault. [Mark Banner]

* Bug 1020449 Loop should show caller information on incoming calls. Patch originally by Andrei, updated and polished by Standard8. r=nperriault. [Andrei Oprea]

* Bug 1078345 - Change references from Firefox WebRTC to Firefox Hello in the standalone UI, as well as fix some strings that weren't being passed the replacement arguments. r=MattN. [Jared Wein]

* Bug 1070753 - Rename standalone client's page title to Firefox Hello. r=dmose. [Jared Wein]

* Bug 1076709 - &quot;Beta&quot; Tag to be added to the panel. r=mikedeboer. [Jared Wein]

* Bug 1080661 - The count of shared URLs should be increased only once per generated URL. r=MattN. [Paolo Amadini]

* Bug 1069816: App name is appended to the document title on Windows and Linux, so authentication failed. r=abr Bug 1069816: App name is appended to the document title on Windows and Linux, so authentication failed. r=abr. [Mike de Boer]

* Bug 1079430 - Land the new Loop strings for Firefox 35. r=Standard8. [Jared Wein]

* Bug 1078309: use a different database for each Fx Account. r=abr,paolo. [Mike de Boer]

* Bug 1078309: use a different database for each Loop Fx Account. r=paolo. [Mike de Boer]

* Bug 1047133 - Persist FxA OAuth token between browser sessions. r=MattN. [Jared Wein]

* Bug 1074672 Part 1 - Implement a room list view for Loop, r=mikedeboer. [Nicolas Perriault]

* Bug 1080094 - Google import fails if a contact contains an org but no title r=dmose. [Adam Roach [:abr]]

* Bug 1078067 - Remove custom background from Loop panel. r=mdeboer. [Tim Nguyen]

* Bug 1037235 - toolkit/loader doesn't check module compatibility r=Mossop,past,jaws f=dteller. [Erik Vold]

* Bug 1079959 - Google import fails if a contact contains a physical address r=mikedeboer. [Adam Roach [:abr]]

* Bug 1017257 - Attach Loop CSP Policy r=sstamm,dmose. [Adam Roach [:abr]]

* Bug 1066735 - Remove root b2g and android specific xpcshell manifests, r=chmanchester. [Andrew Halberstadt]

* Bug 1073859 - Store/restore original pref values rather than resetting them rs=jseup. [Adam Roach [:abr]]

* Bug 1077412 - Add a confirmation dialog when deleting contacts in the Desktop client. r=mikedeboer. [Paolo Amadini]

* Bug 1072323: Hook up the contact menus to be able to start outgoing calls. r=mikedeboer. [Mark Banner]

* Bug 1015988 - Client needs to report number of shared URLs on Desktop. r=MattN. [Paolo Amadini]

* Bug 1065537 - Loop isn't using system/platform fonts in various places. r=mikedeboer. [Jared Wein]

* Bug 1077996 - Allow disabling Loop FxA support and related items (contacts, direct calling) via loop.fxa.enabled. r=mikedeboer. [Matthew Noorenberghe]

* Bug 1078261 - Don't fetch Loop call data for the FxA session if we aren't logged in. r=pkerr. [Matthew Noorenberghe]

* Bug 1077332: fix tests to always show the contacts tab. r=paolo. [Mike de Boer]

* Bug 1077332: hide tabs when not logged in with FxA. r=paolo. [Mike de Boer]

* Bug 972017 Part 4 - Hook up the OT sdk to the direct calling window for Loop. r=nperriault. [Mark Banner]

* Bug 1077332: hide tabs when not logged in with FxA. r=paolo. [Mike de Boer]

* Bug 1037114 - Implement contacts list filtering on Name, Last Name and Mail. r=mikedeboer. [Paolo Amadini]

* Bug 1015988 - Client needs to report number of shared URLs on Desktop. r=MattN. [Paolo Amadini]

* Bug 1047164 - Handle authentication errors (e.g. token expiry) for FxA Loop sessions and notify users. r=jaws. [Matthew Noorenberghe]

* Bug 972017 Part 3 - Finish the view flow transition for direct calling for Loop. r=nperriault. [Mark Banner]

* Bug 1047406 - Remove notifications in Loop conversation window. r=Standard8. [Nicolas Perriault]

* Bug 1074547: improve rendering flow of contacts list. r=Niko. [Mike de Boer]

* Bug 1069816: Enable import button in the contacts list. r=abr. [Mike de Boer]

* Bug 1069816: add unit tests for the GoogleImporter class. r=abr. [Mike de Boer]

* Bug 1069816: implement Google contacts import class. r=abr. [Mike de Boer]

* No bug - Change tabs to spaces in MozLoopPushHandler.jsm r=me DONTBUILD. [Jared Wein]

* Bug 1075697 - MozLoopService.hawkRequest is not properly reset. r=dmose. [Jared Wein]

* Bug 1000240 - Added a Call Failed view for Loop standalone. r=Standard8. [Nicolas Perriault]

* Bug 1074823 - Infinite ringing if the caller cancels the call in the 'connecting' state. Handle the initial state returned from the websocket. r=dmose. [Mark Banner]

* Bug 972017 Part 2 - Set up actions and a dispatcher and start to handle obtaining call data for outgoing Loop calls from the desktop client. r=mikedeboer. [Mark Banner]

* Bug 972017 Part 1 - Add a new controller view for selecting between incoming and outgoing calls in the Loop Conversation window. Also, set up a bare-bones outgoing pending conversation view. r=mikedeboer. [Mark Banner]

* Bug 1038257 - Desktop client needs the ability to delete, block, and unblock contacts. r=mikedeboer. [Paolo Amadini]

* Bug 1038246 - Desktop client needs the ability to edit a contact locally. r=mikedeboer. [Paolo Amadini]

* Bug 1071633 - Add dropdown menu to contact buttons. r=mikedeboer. [Paolo Amadini]

* Bug 1000112 - Desktop client needs the ability to add a contact locally. r=mikedeboer. [Paolo Amadini]

* Bug 1073047 - Add Firefox Account logging to MozLoopService. r=jaws. [Matthew Noorenberghe]

* Bug 1073027 - Control MozLoopService logging with a preference. r=jaws. [Matthew Noorenberghe]

* Bug 1008990 - Loop standalone UI should hand off to FxOS Loop client. r=dmose. [Fernando Jiménez]

* Bug 1072279 - Prevent unnecessary scrollbars in Loop conversation window. r=Standard8. [Nicolas Perriault]

* Bug 1066502 Remove the backbone router from the Loop conversation window, use a react view for control. r=nperriault. [Mark Banner]

* Bug 1071835 - this._hawkRequestError is not a function in MozLoopService.hawkRequest. r=MattN. [Jared Wein]

* Bug 1066816 - Allow OT toolkit to set GUID for analytics r=Standard8. [Adam Roach [:abr]]

* Bug 1070045: shim contacts React classes when ES6 is not available in the browser used. r=Niko. [Mike de Boer]

* Bug 1065144 - Unhide Loop Firefox Account UI. r=standard8. [Matthew Noorenberghe]

* Bug 1070065: MozLoopService.jsm xpcshell unit test for busy reject feature r=standard8. [Paul Kerr [:pkerr]]

* Bug 974873 - Add feedback form to Loop standalone conversation window. r=Standard8. [Nicolas Perriault]

* Bug 1065155: Check both Hawk sessions when PushServer notification received. Record session type with call data. r=standard8. [Paul Kerr [:pkerr]]

* Bug 1032700: LoopService reject with reason = busy an incoming call when busy. r=standard8,MattN. [Paul Kerr [:pkerr]]

* Bug 1069965: add a visual separator between available and blocked contacts. r=paolo. [Mike de Boer]

* Bug 1069962: add support for Gravatar avatars. r=paolo. [Mike de Boer]

* Bug 1000766: add a contacts list to the Loop contacts tab. r=Niko,Standard8,paolo. [Mike de Boer]

* Bug 1047667 - Unregister logged in user from the Loop server upon logout. r=jaws. [Matthew Noorenberghe]

* Bug 1047181 - Change the Loop toolbar button when FxA sign in completes. r=MattN. [Jared Wein]

* Bug 1047667 - Unregister logged in user from the Loop server upon logout. r=jaws. [Matthew Noorenberghe]

* Bug 1047181 - Change the Loop toolbar button when FxA sign in completes. r=MattN. [Jared Wein]

* Bug 1065153 - Support call URLs with guest or FxA hawk session types, r=MattN. [Dan Mosedale]

* Bug 1059186 - Client needs to report number of generated URLs via Telemetry. r=MattN. [Paolo Amadini]

* Bug 1066609 Various Loop xpcshell tests will perma-fail when Gecko 35 merges to beta (turn off throttling for tests). r=abr. [Mark Banner]

* Bug 1069178 Drop some old references to serverUrl/baseServerUrl in Loop desktop code. r=mikedeboer. [Mark Banner]

* Bug 1053774: fix test failures. rs=bustage,Standard8. [Mike de Boer]

* Bug 1053774: use nsIExternalProtocolService to send emails. r=MattN. [Mike de Boer]

* Bug 1067937 Fix translation of Loop's link-clicker UI in Google Chrome. r=dmose. [Mark Banner]

* Bug 1035846 Update the ToS link for the Loop standalone UI. r=dmose. [Mark Banner]

* Bug 1068580 Remove the backbone router from the Loop panel. r=nperriault. [Mark Banner]

* Bug 1066567 Part 2. Rename some old variables in the Loop OutgoingConversationView. r=nperriault. [Mark Banner]

* Bug 1066567 Part 1. Stop use of the backbone router in the standalone UI to simplify code. The views now exclusively manage what is displayed according to state. r=nperriault. [Mark Banner]

* Bug 1066509 - Tests for the tab view in the desktop client panel. r=mikedeboer. [Paolo Amadini]

* Bug 1047146 - Add current username to the Loop panel footer. r=mattn r=niko. [Jared Wein]

* Bug 1068178 - Fix Loop functional test bustage, rs=Standard8, NPOTB, so DONTBUILD. [Dan Mosedale]

* Bug 1044411 - Generate Loop ToS static content, r=abr,dmose; rs=ted for .hgignore changes Bug 1044411 - Generate Loop ToS static content, priv-policy bits removed. [Rémy HUBSCHER]

* Bug 1067519 Loop desktop client should close the conversation window if the caller chooses to cancel the call. r=nperriault. [Mark Banner]

* Bug 1067845 - Clean up after browser_mozLoop_softStart.js. r=abr. [Paolo Amadini]

* Bug 1066816 - Allow OT toolkit to set GUID for analytics r=Standard8. [Adam Roach [:abr]]

* Bug 1045690 Ensure the correct version of react is used when building the Loop jsx files. r=Standard8 Tool script only so DONTBUILD. [Nicolas Perriault]

* Bug 1017257 - Make loop code CSP-friendly (remove all inline script) r=Standard8. [Adam Roach [:abr]]

* Bug 1001090 - Part 5: Fix errors in tests throughout the tree. (r=robcee,gavin) [Shu-yu Guo]

* Bug 1042060 - Implement default answering mode for desktop client. r=mikedeboer. [Andrei Oprea]

* Bug 1066506 Allow easy debugging of websockets and sdk for Loop. r=nperriault. [Mark Banner]

* Bug 1000237 Standalone UI for link clickers needs &quot;call being processed&quot; visual notification. r=nperriault. [Mark Banner]

* Bug 1059754 - Propagating errors to content with cloneInto fails in MozLoopAPI. r=Gijs. [Paolo Amadini]

* Bug 1066219 Update OpenTok library to 2.2.9. r=abr. [Mark Banner]

* Bug 1065777 - Store the Hawk Session token after /fxa-oauth/params for the Loop FxA login flow. r=abr,jaws. [Matthew Noorenberghe]

* Bug 1047146 - Fixed panel_test.js to reference userProfile instead of loggedInToFxa on a CLOSED TREE. r=me. [Jared Wein]

* Bug 1062126: Loop panel UI shouldn't be fully reset when reopened, r=mikedeboer. [Nicolas Perriault]

* Bug 1047146 - Add current username to the Loop panel footer. r=mattn r=niko. [Jared Wein]

* Bug 1065275: add a TabView component to the panel. r=paolo,Niko. [Mike de Boer]

* Bug 1065608 Drop the remaining backbone views for Loop (switch to react). r=nperriault. [Mark Banner]

* Bug 1065591 Improve Loop xpcshell tests for MozLoopService to have a better chance of detecting coding errors. r=jaws. [Mark Banner]

* Bug 1035348 - Part 2: fix tests. 1) Added hawkRequest stub to allow completion of inbound notification setup where necessary in unit tests. 2) Replaced tests of client.requestCallsInfo() with mozLoop.getCallData. r=Standard8. [Paul Kerr [:pkerr]]

* Bug 1035348 - Part 1: Move GET/calls to MozLoopService. r=Standard8. [Paul Kerr [:pkerr]]

* Bug 1065052 - Follow-up - Correctly pass the sessionType to MozLoopServiceInternal.hawkRequest. rs=mikedeboer DONTBUILD. [Matthew Noorenberghe]

* Bug 1065052 - Implement modified Loop FxA registration flow using a second Loop registration. r=abr,jaws. [Matthew Noorenberghe]

* Bug 1065052 - Implement modified Loop FxA registration flow using a second Loop registration. r=abr,jaws. [Matthew Noorenberghe]

* Bug 1049565 - Update style for feedback form back button. r=nperriault. [Andrei Oprea]

* Bug 1002416 Rework the Loop notification system to better surface failures to the user and use react based views. r=nperriault. [Romain Gauthier]

* Bug 1062835 Missing text on Loop's link-clicker UI for non-English locales. Update the standalone app to the gaia version of L10n.js which supports fallback automatically. r=nperriault. [Mark Banner]

* Bug 1061756 - Remove MozLoopService #ifdef DEBUG and fix tests. r=jaws. [Matthew Noorenberghe]

* Bug 1035655 - Use the production build of React for non-DEBUG builds, r=Standard8. [Dan Mosedale]

* Bug 1048938 - Part 2 of visual uplift, r=NiKo` [Andrei Oprea]

* Bug 1061013 - Disable various browser chrome tests when running with e10s. r=jimm. [Bill McCloskey]

* Bug 1055139 - Retrieve Simple Push Server URL from Loop Server r=mhammond,Standard8. [Adam Roach [:abr]]

* Bug 1055139 - Retrieve Simple Push Server URL from Loop Server r=mhammond,Standard8. [Adam Roach [:abr]]

* Bug 1055319 - Add DNS-based soft-start mechanism for Loop in release builds r=dolske. [Adam Roach [:abr]]

* Bug 1055239 - SVG icons and theming for SocialAPI/Loop. r=MattN. [Jared Wein]

* Bug 1060610 - Don't update latest callUrl expiration until it is exfiltrated r=Standard8. [Adam Roach [:abr]]

* Bug 1055139 - Retrieve Simple Push Server URL from Loop Server r=mhammond. [Adam Roach [:abr]]

* Bug 1047284 - Update the Loop toolbar icon upon errors and &quot;Do not disturb&quot;. f=Standard8 r=jaws. [Matthew Noorenberghe]

* Bug 1060812 - Stop processing when contact is not found r=Standard8. [Adam Roach [:abr]]

* Bug 1061154 Part 3 Fix some more Loop strings following UX feedback, and add necessary strings for outgoing calls from the desktop client. r=nperriault,r=abr. [Mark Banner]

* Bug 1047144: Add a gear menu to the Loop panel. r=Standard8. [Nicolas Perriault]

* Bug 1061154 Part 2 Change existing Loop strings based on UX feedback. r=nperriault. [Mark Banner]

* Bug 1055319 - Add DNS-based soft-start mechanism for Loop in release builds r=dolske. [Adam Roach [:abr]]

* Bug 1050309 - Support RTL mode in the panel. r=standard8. [Jared Wein]

* Bug 1060452 - Add generic-failure string for Loop clients. rs=MattN. [Jared Wein]

* Bug 1060525 - Various string changes for Loop based on UX feedback. rs=MattN. [Jared Wein]

* Bug 1060459 - Change &quot;How was your call experience?&quot; to &quot;How was your conversation?&quot;. r=abr. [Jared Wein]

* Bug 1048882 follow-up - Change the string ID of feedback_window_will_close_in. r=standard8. [Jared Wein]

* Bug 972079 - Fix memory leak failure in mochi test rs=me. [Adam Roach [:abr]]

* Bug 972079 - Tests for CardDav importer r=MattN. [Adam Roach [:abr]]

* Bug 972079 - CardDAV Address Importer for Loop r=MattN. [Adam Roach [:abr]]

* Bug 1059021: Added sign in/up link to the Loop panel footer. Patch by MattN and nperriault. r=MattN,r=Standard8. [Matthew Noorenberghe]

* Bug 1045643 Part 2 - Notify the Loop server when the client has local media up and remote media being received, so that it can update the call connection status. r=nperriault. [Mark Banner]

* Bug 1045643 Part 1 - Notify the Loop server when the desktop client accepts the call, so that it can update the call status. r=nperriault. [Mark Banner]

* Bug 1048882 - The warning displayed when closing window (feedback_window_will_close_in) needs a plural form. r=standard8. [Jared Wein]

* Bug 1048938 - Part 1 of visual uplift, patch by loop frontend-ers; r=dmose. [Dan Mosedale]

* Bug 1058258 - Fix typos and improve some of the Loop text. r=abr. [Jared Wein]

* Bug 1056918 - Allow distinguishing between 'not found' and 'database error' programmatically r=standard8. [Adam Roach [:abr]]

* Bug 1058111 Fix functional test setup for Loop to set the correct public server address so that websocket connections work correctly. r=dmose. [Mark Banner]

* Bug 1054793 - comment fix. r=dmose. [Jan-Ivar Bruaroey]

* Bug 1046039 Have a longer time window for users to view Terms of Service and Privacy Notice from the Loop panel. r=mhammond. [Mark Banner]

* Bug 1019454: Hide ToS when it has been seen in the standalone UI. r=Standard8. [Romain Gauthier]

* Bug 1047617 - Register logged in user with the Loop server. r=ckarlof,vladikoff,markh. [Matthew Noorenberghe]

* Bug 1054793 - Increase marionette find_element timeout for intermittent. r=standard8 CLOSED TREE. [Jan-Ivar Bruaroey]

* Bug 1045569 - Revoke the correct call url in loop desktop client, r=rgauthier@mozilla.com. [Andrei Oprea]

* Bug 1046178 - Prevent using hardcoded brand names in l10n data files. r=jaws. [Alex Bardas]

* Bug 1038716 - add unit tests for LoopContacts crud operations. r=dmose. [Mike de Boer]

* Bug 1038716 - add a contacts API. r=abr,dolske,mak,bholley. [Mike de Boer]

* Bug 1055747 - Fix Loop UI showcase for Chrome to avoid visual regressions, r=andrei.br92@gmail.com. [Dan Mosedale]

* Bug 976116 - Implement end to end call in one browser window, r=dmose. [Andrei Oprea]

* Bug 1047130 - Implement desktop backend to login to FxA via OAuth for Loop. r=vladikoff,ckarlof,mikedeboer. [Matthew Noorenberghe]

* Bug 1048530 - Create a Loop test server for exchanging an OAuth code for a token. r=vladikoff,ckarlof,mikedeboer. [Matthew Noorenberghe]

* Bug 1048526 - Create a Loop test server for querying OAuth URL parameters to use. r=ckarlof,vladikoff,jaws. [Matthew Noorenberghe]

* Bug 1022594 Part 2. Desktop client needs ability to decline an incoming call - set up a basic websocket protocol and use for both desktop and standalone UI. r=dmose. [Mark Banner]

* Bug 990678 - Add ability to make audio only calls in Loop standalone and desktop. r=Standard8. [Andrei Oprea]

* Bug 1022594 Part 1a Add a getLoopBoolPref function to the MozLoopAPI. r=mikedeboer. [Mark Banner]

* Bug 1046490 Ensure Loop is always enabled in tests, so that turning the pref off doesn't cause failures. r=mikedeboer. [Mark Banner]

* Bug 1053181 Fix Loop's standalone pages to display correctly on the proper dev server. r=dmose NPOTB DONTBUILD. [Mark Banner]

* Bug 1052331 Remove the 'LooP' title from the conversation window when it is initially opened. r=mikedeboer. [Mark Banner]

* Bug 1050932 - Fix UI showcase regression triggered by tokbox SDK upgrade, NPOTB, DONTBUILD, r=Standard8. [Dan Mosedale]

* Bug 1048785 Part 2: Extend MozLoopAPI with channel, version and OS details. r=mikedeboer. [Mark Banner]

* Bug 1048785 Part 1: Update Loop FeedbackAPIClient to allow attaching more metadata. r=Standard8. [Nicolas Perriault]

* Bug 1050263: Remove incorrect name reference from email subject when emailing a loop url r=dhenein,arcadio. [Mark Banner]

* Bug 1049927 Update OpenTok library to 2.2.7. r=dmose. [Mark Banner]

* Bug 1050314 Loop standalone client is broken in Chrome due to use of ES6 functions. r=dmose. [Mark Banner]

* Bug 1000771: Add a button to copy Loop urls to the clipboard. r=mikedeboer. [Nicolas Perriault]

* Bug 1048834 - Fixed empty sad feedback description field for Loop for predefined categories. r=Standard8,ui-review=darrin. [Nicolas Perriault]

* Bug 1000772: Allow Loop users to send a call-back URL by email. r=nperriault. [Romain Gauthier]

* Bug 1022594 Part 1 follow-up. Fix random failure in browser/components/loop/test/standalone/index.html - use fake timers to prevent timers kicking in when we don't want them. r=nperriault. [Mark Banner]

* Bug 1022594 Part 1 Change Loop's incoming call handling to get the call details before displaying the incoming call UI. r=nperriault. [Mark Banner]

* Bug 976114 - stand up basic functional test for a fetching a URL, r=Standard8. [Dan Mosedale]

* Bug 1040662: Fixed erroneous path to react lib in Loop UI showcase. r=Standard8 NPOTB DONTBUILD. [Nicolas Perriault]

* Bug 1040662: Upgrade Loop's use of React to version 0.11.1. r=Standard8. [Nicolas Perriault]

* Bug 1034841 - Loop: Fix 'Privacy notice' url and also improve l10n situation. r=Standard8. [Sebastian Hengst]

* Bug 972992 (Part 2): Loop desktop feedback add an API client to actually submit feedback. r=Standard8. [Nicolas Perriault]

* Bug 972992 (Part 1): Loop desktop client user feedback form. r=Standard8. [Nicolas Perriault]

* Bug 1000127 - Implement new standalone UI link clicker, r=dmose. [Andrei Oprea]

* Bug 1044419 Change the Loop Standalone client to use the same version of the sdk as the desktop. r=nperriault. [Mark Banner]

* Bug 1044796 Provide an option to Loop's standalone client makefile to create a version.txt file. r=nperriault. [Mark Banner]

* Bug 1044162 - part 1 - make EXTRA_{PP_,}JS_MODULES communicate their installation path; r=mshal. [Nathan Froyd]

* Bug 1033988 Remove workaround for old-style parameter when getting a call url from the Loop server. r=nperriault. [Mark Banner]

* Bug 1035369 Update the parameter name for the push url when registering with the Loop server to match with the latest version of the API. r=mdeboer. [Mark Banner]

* Bug 1042799: Loop UI components showcase, r=mikedeboer. [Nicolas Perriault]

* Bug 1000131 (Part 2): Loop expired call url view styling, r=dmose. [Nicolas Perriault]

* Bug 1044188: Update message for link clickers using browsers without WebRTC support, r=dmose. [Maire Reavy]

* Bug 1000134 - Implement revoke generated URL for incoming call view, r=dmose. [Andrei Oprea]

* Bug 1038648: [Loop] ensure exposed objects are immutable to prevent abuse by others. r=dolske. [Mike de Boer]

* Bug 1027242 - Blacklist mulet's failing tests + expose 'mulet' to ini files; fix previous bustage on a CLOSED TREE, r=ahal. [Alexandre Poirot]

* Bug 1020445: Fixed Loop conversation layout on Google Chrome, r=dmose. [Nicolas Perriault]

* Bug 1000131 - Expired Loop call url notification, r=dmose. [Nicolas Perriault]

* Bug 1040901 - Make Loop incoming call view match MVP spec, r=dmose. [Andrei Oprea]

* Bug 1038699 - Loop no longer resets the hawk session token when it is invalid. Handle the new server responses. r=dmose. [Mark Banner]

* Bug 1002414 - Part 2: Add additional tests for new functional paths. r=standard8. [Paul Kerr [:pkerr]]

* Bug 1002414 - Part 1: Add retry logic to PushServer user agent. r=standard8. [Paul Kerr [:pkerr]]

* Bug 1039263: Fixed standalone Loop UI couldn't restart a call. r=dmose. [Nicolas Perriault]

* Bug 1036661 Accessing the loop panel for the first time triggers an error message in the console. r=dolske. [Mark Banner]

* Bug 1039757 Add a script to run relevant unit tests for Loop. r=dmose. [Mark Banner]

* Bug 1038675 expiresAt parameter of /call-url/ response has changed from hours to seconds with the latest server version (Loop desktop client doesn't register on startup of browser). r=nperriault. [Mark Banner]

* Bug 1020448 - Add Loop pending call timeout for the link clicker UI. r=Standard8,ui-review=dhenein. [Nicolas Perriault]

* Bug 1017273 Change Loop from compile-time enabled to runtime-enabled with a pref. r=dolske,r=jesup,r=glandium,r=gijs. [Mark Banner]

* Bug 1033362 Implement basic mochitests for MozLoopAPI. r=dolske,r=glandium. [Mark Banner]

* Bug 1035831 Stop video streams fading when mousing over video in Loop. r=dmose. [Mark Banner]

* Bug 1033843 Change the Loop conversation window to use React-based views. Patch by dmose and nperriault. r=Standard8. [Dan Mosedale]

* Bug 998989 - anonymize sensitive data in telemetry log. r=ekr, r=dveditz. [Jan-Ivar Bruaroey]

* Bug 998989 - save as telemetry ping file for upload by telemetry. r=vladan. [Jan-Ivar Bruaroey]

* Bug 998989 - upload telemetry logs on Loop ICE failure. r=smaug, r=abr. [Jan-Ivar Bruaroey]

* Bug 1000770 bustage fix, a=KWierso. [Dan Mosedale]

* Bug 1000770 - Implement new UX for loop panel, ui-r=darrin, r=dmose. [Andrei Oprea]

* Bug 1032469 Update Loop to OpenTok library v2.2.6. rs=gijs for test change,r=abr. [Mark Banner]

* Bug 1032469 Update Loop to OpenTok library v2.2.6. r=abr. [Mark Banner]

* Bug 1000152: Add mute &amp; unmute buttons to Loop conversation window. r=Standard8. [Nicolas Perriault]

* Bug 1033715 - Add build script to transpile JSX files to JS, r=dmose. [Andrei Oprea]

* Bug 1033841: Ported Loop panel views to React. r=Standard8. [Nicolas Perriault]

* Bug 1033841: Added react 0.10.0 to loop shared libs. r=dmose. [Nicolas Perriault]

* Bug 1033841: Ported Loop panel views to React. r=Standard8. [Nicolas Perriault]

* Bug 1033841: Added react 0.10.0 to loop shared libs. r=dmose. [Nicolas Perriault]

* Bug 1015891 Implement ToS and privacy notice links for Loop. r=dmose. [Andrei Oprea]

* Bug 1032741 Adapt to latest Loop server changes - update parameter name for /calls_url and add a callType parameter when starting a call. r=nperriault. [Mark Banner]

* Bug 1032738 Desktop client fails to authenticate session tokens with the latest loop server - change to using a hex key for hawk. r=jparsons. [Mark Banner]

* Bug 1020876 Route desktop client XHRs though the mozLoop API to share hawk implementation with MozLoopService. r=ttaubert. [Mark Banner]

* Bug 1026782 Implements MozLoopService.setLoopCharPref. r=ttaubert. [Jan-Ivar Bruaroey]

* Bug 1023507 - Handle SDK failures when calling connect. r+ui-r=dmose. [Andrei Oprea]

* Bug 1011472 - Add audio alert for incoming call r=florian,standard8. [Adam Roach [:abr]]

* Bug 1030062 Loop Marionette tests need clearer failure points when displayed on tbpl. r=dburns. [Mark Banner]

* Bug 914753: Make Emacs file variable header lines correct, or at least consistent. DONTBUILD r=ehsan. [Jim Blandy]

* Bug 1023279 Make conversation window title localizable, and add missing license header. r=nperriault,ui-review=darrin. [Mark Banner]

* Bug 1026504 - Clarify non-shared status of sdk and webl10n for Loop by moving them from the shared libs to non-shared. r=nperriault. [Mark Banner]

* Bug 1020859 Part 2 - Change Loop to use HawkClient to increase shared code usage and make MozLoopService simpler. r=mhammond. [Mark Banner]

* Bug 1022689 Separate out the Loop Push Handler from the Loop Service code to help similify testing and clarify separation of modules. r=mhammond. [Mark Banner]

* Bug 1022874 - Add non-minified version of Backbone for Loop. r=Standard8. [Nicolas Perriault]

* Bug 1022873 - Add non-minified version of Lodash for Loop. r=Standard8. [Nicolas Perriault]

* Bug 1022872 - Add non-minified version of jQuery for Loop. r=Standard8. [Nicolas Perriault]

* Bug 1022772 - SJCL should be unminified, versioned r=Standard8. [Adam Roach [:abr]]

* Bug 1018208 - Write missing tests for Loop &quot;do not disturb&quot; feature. r=Standard8. [Nicolas Perriault]

* Bug 994483 Fix running marionette tests locally and bug 1021573 Fix intermittent failure due to the server trying to bind to a socket that hasn't been released yet. r=jgriffin. [Mark Banner]

* Bug 1020451 Implement basic accept/reject call buttons so that video isn't shown before the call is accepted. r=Standard8. [Nicolas Perriault]

* Bug 994131 - Change URLs in OT.properties to use https r=Standard8. [Adam Roach [:abr]]

* Bug 1003029 Use local versions of OT assets. r=Standard8,rs=gijs,r=abr. [Nicolas Perriault]

* Bug 1021036 - Change default button color from grey to purple r=NiKo` [Adam Roach [:abr]]

* Bug 994483 Add Loop unit tests to tbpl. r=dburns. [Mark Banner]

* Bug 1020540 - Include only those components we need from SJCL r=Standard8. [Adam Roach [:abr]]

* Bug 1018875 Prevent displaying OT GuM custom dialog. r=Standard8. [Nicolas Perriault]

* Bug 987086 Loop web client should use configuration for determining server url. r=nperriault, r=Standard8. [Alexis Metaireau]

* Bug 1017902 Use saved hawk session tokens, if possible, when registering with the server to preserve the session across restarts. r=jparsons,r=mhammond. [Mark Banner]

* Bug 1017394 In MozLoopService use promises rather than callbacks to make the code cleaner. r=mhammond. [Mark Banner]

* Bug 1003029 Use local versions of OT assets for Loop. r=Standard. [Nicolas Perriault]

* Bug 1020121 Remove unnecessary/erroneous .gitignore files from loop. r=nperriault. [Mark Banner]

* Bug 994152 Loop needs a &quot;do not disturb&quot; control. r=mhammond,r=Standard8. [Nicolas Perriault]

* Bug 1017206: Update SDK to 2.2.5 rs=me. [Adam Roach [:abr]]

* Bug 1017882 Remove unnecessary and incorrect padding value for notification close buttons. r=nperriault. [Mark Banner]

* Bug 994485 Update loop's readme and remove redundant make-links.sh DONTBUILD. [Mark Banner]

* Bug 994485 Make standalone tests work with combined repositories/changed file layout, and fix the standalone server. r=dmose. [Mark Banner]

* Bug 976109 - Switch session tokens from cookies to Hawk, r=NiKo`,Standard8. [Dan Mosedale]

* Bug 994151 Part 2. Only register with the servers if the user has obtained call urls that haven't expired yet. r=dmose. [Mark Banner]

* Bug 994151 Part 1. Ensure the client is registered before requesting a call url. r=dmose. [Mark Banner]

* Bug 1013092 Remove the logo from the video stream. r=nperriault. [Mark Banner]

* Bug 974895: Added landing page for unsupported devices, r=Standard8. [Nicolas Perriault]

* Bug 1005041: In progress feedback when getting a call url, r=dmose. [Nicolas Perriault]

* Bug 997178 - Restart a call, r=dmose. [Nicolas Perriault]

* Bug 972941: Landing page for non WebRTC-compliant browsers on supported devices. r=nperriault. [Romain Gauthier]

* Bug 999480 - Panel to use a router &amp; templated views, r=Standard8. [Nicolas Perriault]

* Bug 998271 - L10n notifications, r=dmose. [Nicolas Perriault]

* Bug 991118 - Going back should terminate call session, r=dmose. [Nicolas Perriault]

* Bug 991128 - make reloading a live call do something reasonable, r=dmose. [Nicolas Perriault]

* Bug 996526 - Backbone views to carry their own templates. r=dmose. [Nicolas Perriault]

* Bug 972019 - Shared conversation router logic. r=dmose. [Nicolas Perriault]

* Bug 995194 Don't unpublish when receiving sessionDisconnected, as we've implicitly unpublished already, r=dmose. [Mark Banner]

* Bug 976127 - Get marionette to drive shared and desktop-local unit tests, r=Standard8. [Dan Mosedale]

* Bug 972019: Terminate a call. r=Standard8. [Nicolas Perriault]

* Bug 993324 Upgrade Loop to use TokBox SDK v2.2 r=nperriault. [Mark Banner]

* Bug 991126 - Prevented multiple form submission. r=Standard8. [Nicolas Perriault]

* Bug 988229 - Shared notifier component. r=dmose. [Nicolas Perriault]

* Bug 991122 - Fixed video layout on Google Chrome. r=dmose. [Nicolas Perriault]

* Bug 991654 - Updated client to use new server error format. r=Standard8. [Nicolas Perriault]

* Bug 985596 Improve conversation model to handle incoming and outgoing calls. r=dmose. [Mark Banner]

* Bug 985596 - Refactored shared assets &amp; tests. r=dmose. [Nicolas Perriault]

* Bug 985596 Set up initial desktop window - share some of the webapp models and views with the desktop client. r=dmose. [Mark Banner]

* Bug 979880 - Implement basic UI+logic for initiating a call. r=Standard8. [Nicolas Perriault]

* Bug 983697 - Fill loop-client repository with basic server &amp; readme. r=dmose. [Nicolas Perriault]

* Bug 976109 - Load and package Hawk libraries, r=NiKo` [Dan Mosedale]

* No bug - Bandaid to make registration work right; real fix coming in bug 1017394, rs=Standard8. [Dan Mosedale]

* Bug 976109 - Implement mozLoop.getLoopCharPref, r=mhammond. [Dan Mosedale]

* Bug 976109: Save hawk-session-token to prefs at reg time for later use; r=mhammond. [Dan Mosedale]

* Bug 994151 Part 2. Only register with the servers if the user has obtained call urls that haven't expired yet. r=dmose. [Mark Banner]

* Bug 994151 Part 1. Handle registration errors better, with simple notifications to the user, and handle subsequent attempts to register with the server. r=dmose. [Mark Banner]

* Bug 1005245 Remove now redundant test harness code. r=nperriault. [Mark Banner]

* Bug 1008122 Loop content changes for the separation of Loop from Social. r=nperriault. [Mark Banner]

* Bug 1000007 Separate out loop from the social api, and add a loop specific service and API injection. r=mhammond. [Mark Banner]

* Bug 1005041: In progress feedback when getting a call url, r=dmose. [Nicolas Perriault]

* Bug 994146: panel should be reset when closed, r=dmose. [Nicolas Perriault]

* Bug 999480 - Panel to use a router &amp; templated views, r=Standard8. [Nicolas Perriault]

* Bug 998271 - L10n notifications, r=dmose. [Nicolas Perriault]

* Bug 991118 - Going back should terminate call session, r=dmose. [Nicolas Perriault]

* Bug 996526 - Backbone views to carry their own templates. r=dmose. [Nicolas Perriault]

* Bug 972019 - Shared conversation router logic. r=dmose. [Nicolas Perriault]

* Bug 972019: Terminate a call. r=Standard8. [Nicolas Perriault]

* Bug 987252 - Using new shared notification system. r=Standard8. [Nicolas Perriault]

* Bug 976127 - Get marionette to drive desktop-local &amp; shared unit tests, r=Standard8. [Dan Mosedale]

* Bug 985596 Set up initial desktop conversation window. r=dmose. [Mark Banner]

* Bug 985596 - Updated shared assets &amp; tests layout. r=Standard8. [Nicolas Perriault]

* Bug 989127 - README build clarifications r=Standard8. [Dan Mosedale]

* Bug 988457 - Remove loop shared dir, add README for building, r=Standard8. [Dan Mosedale]

* Bug 987597: Send an caller identifier when obtaining a call-url. r=Standard8. [Romain Gauthier]

* Bug 985596 Set up the conversation window infrastructure and obtain the list of calls. r=dmose. [Mark Banner]

* Bug 972020 - Loop basic UI. r=Standard8. [Nicolas Perriault]

* Bug 978952 - stand up trivial mocha/chai test; code by @n1k0 and @dmose; r=Standard8. [Nicolas Perriault]

* Bug 976358: Adding chrome URL for Loop panel. r=tOkeshu. [Adam Roach]

* Bug 975548: Import minimal frameworks for client. r=nperriault. [Adam Roach]

### Chores

* Update babel-plugin-transform-react-jsx to version 6.4.0. r=Standard8. [greenkeeperio-bot]

* Update babel-plugin-transform-react-display-name to version 6.4.0. r=Standard8. [greenkeeperio-bot]

* Update babel-cli to version 6.4.0. r=Standard8. [greenkeeperio-bot]

* Update webpack to version 1.12.10. r=Standard8. [greenkeeperio-bot]

### Other

* 0.1.0. [Mark Banner]

* Ignore the pep8 error for module imports not being at the top of the file and fix versions of flake8 dependencies to stop them being updated underneath us. r=crafuse. [Mark Banner]

* Follow to bug 1232707 - Adjust how react is included into Loop in release and debug configurations. r=glandium. [Mark Banner]

* Remove error message about favicon when the error is just not-found. r=Standard8. [Ian Bicking]

* Update the list of exclude directories for flake. r=Mardak. [Mark Banner]

* Include some information in the README about building the add-on and using runfx. [Ian Bicking]

* Move contributing into its standard GitHub location. [Ian Bicking]

* Revert &quot;Bug 1231808 - Hide pause from Infobar.&quot; r=Standard8. [Mike de Boer]

* Make sure to make ./node_modules/ so packages are installed locally. [Ian Bicking]

* Follow-up to bug 1213984 - remove the obsolete LoopStorage.jsm. rs=dmose over irc. NPOTB DONTBUILD. [Mark Banner]

* Backout bug 1210865 / changeset dcd113d0102e due to apparent bustage of Loop's setup system for data channels. [Mark Banner]

* Backed out changeset 79a231b4477d (bug 1205684) for Mn loop bustage. [Wes Kocher]

* Follow-up to bug 1212272 - use the correct cp command. r=dmose. [Mark Banner]

* Backed out 2 changesets (bug 1202902) to recking bug 1202902 to be able to reopen inbound on a CLOSED TREE. [Carsten &quot;Tomcat&quot; Book]

* Backed out changeset c6b267589d0d (bug 1202902) for Mulet Reftest, W3C Platform Test and other failures. r=backout a=backout on a CLOSED TREE. [Sebastian Hengst]

* Backed out 1 changesets (bug 1202902) for causing merge conflicts to mozilla-central. [Carsten &quot;Tomcat&quot; Book]

* Backed out 3 changesets (bug 1192924) for Android bustage CLOSED TREE. [Wes Kocher]

* Follow-up to bug 1199213 - put back a hook required for Loop's functional tests that was taken out by mistake. rs=Mardak. [Mark Banner]

* Backed out changeset 18f5bcaab8ec (bug 1190738), to avoid a nasty merge issue. [Dan Mosedale]

* Follow-up to bug 1174702 - correctly align the title of the web page for the checkbox in the context editing. r=andreio. [Mark Banner]

* Backed out changeset f4f36fc12c1f (bug 1184559) for Marionette failures. CLOSED TREE. [Ryan VanderMeulen]

* Reland bug 1180603 - Text inside text bubbles should always be aligned according to the text direction - which was mistakenly backed out by bug 1183576. r=Standard8. [Mark Banner]

* Backed out changesets 7f2ddcfe4537 and e88770aa2160 (bug 1171344) for intermittent OSX browser_tabopen_reflows.js failures. [Ryan VanderMeulen]

* Backed out changeset f983c54e52e1 (bug 1183576) for browser_parsable_css.js failures. [Ryan VanderMeulen]

* Follow-up to bug 1174945 - fix generated react file output for some files that were missed in the commit. rs=dmose over irc. [Mark Banner]

* Backed out changeset 32c21104e02c (bug 1164510) for causing frequent browser_UITour_loop.js failures. [Ryan VanderMeulen]

* Backed out changeset 13ef6f65874d (bug 1164510) for bc1/bc3 test failures. [Carsten &quot;Tomcat&quot; Book]

* Backed out changeset 2ba82990c44b (bug 1170627) for bc1/bc3 test failures. [Carsten &quot;Tomcat&quot; Book]

* Follow-up to Bug 1152764 - use indexOf rather than includes as Array.prototype is only available on nightly builds. r=mikedeboer. [Mark Banner]

* Follow-up to bug 1153788. Improve strings for L10n - use existing replacements for brandname and improve the localisation notes. r=mikedeboer,a=Tomcat. [Mark Banner]

* Fix browser_parsable_css.js bustage from bug 1142515 - use correct way to reset padding-left to default. rs=bustage-fix for CLOSED TREE. [Mark Banner]

* Backed out changeset 93f39df2f4f3 (bug 1161926) for test failures in browser_parsable_css.js. [Carsten &quot;Tomcat&quot; Book]

* Backed out changeset b0573ebe7b3a / bug 1151862 for incorrectly including two different bugs in one commit. [Mark Banner]

* Backed out changeset d94ef5bca70e (bug 1152761) for xpcshell failures. [Ryan VanderMeulen]

* Follow-up to bug 1142514 - make the pref name checks match the real pref name even though its spelt wrong. rs=mikedeboer over irc. [Mark Banner]

* Backed out 5 changesets (bug 1132301) for intermittent browser_mozLoop_socialShare.js failures. [Ryan VanderMeulen]

* Follow-up to bug 1150632 - add documentation for running eslint against Loop's jsm files. rs=dmose over irc. NPOTB DONTBUILD. [Mark Banner]

* Backed out changeset b192e6e16c1b (bug 1142687) for mochitest-e10s failures. CLOSED TREE. [Ryan VanderMeulen]

* Fix unit-test bustage from bug 1143629 - update the test as well. rs=bustage-fix. [Mark Banner]

* Follow-up to bug 1140481 - Fix Loop's ui-showcase. rs=dmose over irc NPOTB DONTBUILD CLOSED TREE. [Mark Banner]

* Backed out changeset c4d7c9f94f61 (bug 1140481) because the other part was also backed out, CLOSED TREE. [Wes Kocher]

* Backed out changeset 35827fc86c80 (bug 1140481) under suspicion of making wpt-reftests intermittently fail on a CLOSED TREE. [Wes Kocher]

* Follow-up to bug 1140481 - Fix Loop's ui-showcase. rs=dmose over irc NPOTB DONTBUILD CLOSED TREE. [Mark Banner]

* Fix regression in Loop's functional tests from bug 1107336 - use the correct imports so that exceptions are matched correctly. rs=AutomatedTester over irc. DONTBUILD as NPOTB a=RyanVM for CLOSED TREE. [Mark Banner]

* Follow-up to bug 1131574 - temporarily disable mochitest on e10s due to apparent load complete detection issues. rs=bustage-fix for CLOSED TREE. [Mark Banner]

* Backed out changeset 13d9a5e39eb3 (bug 967792) for Gaia unit test failures. [Ryan VanderMeulen]

* Backed out changeset b04123c901ac (bug 1121210) for Mn failures. [Wes Kocher]

* Backed out changeset 21a0484b3fa7 (bug 1115227) for frequent bc1 failures on a CLOSED TREE. [Wes Kocher]

* Resync Loop's webapp.js with webapp.jsx - fallout from bug 1120003. rs=mikedeboer. [Mark Banner]

* Fix marionette bustage - follow-up of bug 1080948. CLOSED TREE. r=bustage. [Mike de Boer]

* Follow-up to bug 1045498. Fix Loop's ui-showcase to load properly. rs=nperriault over irc, NPOTB so DONTBUILD. [Mark Banner]

* Backed out changeset c9f946144a73 (bug 1104921) for bc2 failures on some platforms. [Matthew Noorenberghe]

* Follow-up to bug 1079225 - Fix formatting of the waiting for media message in Loop rooms, and ensure feedback can be given for multiple conversations in a row. r=abr. [Mark Banner]

* Follow-up to bug 1099128 - fix issues with error values not being correctly handled by the room store, and switch the tests back to running with rooms enabled by default. r=nperriault. [Mark Banner]

* Backed out 2 changesets (bug 1100284) for xpcshell orange. [Wes Kocher]

* Backed out changeset a46accc80752 (bug 1100284) for xpcshell bustage. [Wes Kocher]

* Follow-up to bug 1099128 - temporarily turn off rooms for mochitests to fix bc1 test failures. rs+a=bustage-fix. [Mark Banner]

* Bustage fix from bug 1074688 part 3, conflicting with another patch. Fix the mocking of the tests to fix stubbing. rs+a=bustage-fix. [Mark Banner]

* Backed out changeset b0843f9cb541 (bug 1079941) for mochitest-bc failures. CLOSED TREE. [Ryan VanderMeulen]

* Fix typo in addressing review comments in bug 1020449 that caused broken jsx. rs=NiKo. [Mark Banner]

* Backed out changeset 047060a5b1dc (bug 1078309) for failing browser_LoopContacts.js. [Jared Wein]

* Backed out changeset 4205a47f317c (bug 1037235) for xpcshell orange. CLOSED TREE. [Ryan VanderMeulen]

* Follow-up to bug 1072323 - Fix the Loop ui-showcase by passing a mock contact parameter, which is now needed rather than the call Id. rs=nperriault over irc. NPOTB so DONTBUILD. [Mark Banner]

* Backed out changeset 0a3385aaff01 (bug 1015988) for mochitest-bc orange. [Ryan VanderMeulen]

* Backed out changeset 53e7cea7d468 (bug 1077332) for Marionette failures. [Ryan VanderMeulen]

* Backed out changeset b26c709330d6 (bug 1069962). r=paolo. [Mike de Boer]

* Follow-up to bug 1000240 Fix the generated conversation.js file, missed during bitrot. rs=nperriault. [Mark Banner]

* Follow-up to bug 1035846 Add a slash onto the end of the url for the ToS Link on the Loop Standalone UI. rs=mikedeboer over irc DONTBUILD. [Mark Banner]

* Backed out changeset 5710731f09e9 (bug 1047181) for bc1 orange. [Wes Kocher]

* Backed out changeset 43b24197d25a (bug 1047667) to cleanly backout 1047181. [Wes Kocher]

* Follow-up to bug 1044411, fix the Loop standalone .gitignore file to properly exclude index.html. rs=mikedeboer over irc. NPOTB DONTBUILD. [Mark Banner]

* Fix the loop ui-showcase - fallout from bug 1066506, define getBoolPreference in the fake mozLoop api. rs=dmose over irc DONTBUILD. [Mark Banner]

* Backed out changeset ecc5cb4dcdfe (bug 1066816) for loop test failures. [Ed Morley]

* Backed out changesets 26b240144648 and a701b0b291a0 (bug 1047146) for linux debug mochitest-bc crashes. [Ryan VanderMeulen]

* Follow-up to bug 1035348 - fix the conversation window not opening when incoming calls are received. rs=jaws. [Mark Banner]

* Backed out changeset cea07e54707e (bug 1065052) for xpcshell test failures. [Carsten &quot;Tomcat&quot; Book]

* Backed out changeset e6cf07180934 (bug 1055139) for xpcshell bustage. [Adam Roach [:abr]]

* Backed out 2 changesets (bug 1055139) for bad network touches CLOSED TREE. [Phil Ringnalda]

* Fix 'touches the network' bustage from Bug 1055139 on a CLOSED TREE rs=me. [Adam Roach [:abr]]

* Backout cset b2bae68e3809 / bug 1055319 due to test failures. [Mark Banner]

* Backed out changeset 7e27f2f4793c (bug 1032469) for bc1 and dt-1 test failures on a CLOSED TREE. [Carsten &quot;Tomcat&quot; Book]

* Back out csets 56ba52f28300, f6016481c7f2, 94b064ee68b2 (bug 1033841 and bug 1033965) for xpcshell test failures. [Benoit Jacob]

* Backed out changeset 3540ecf33808 / bug 1003029 due to test failures. [Mark Banner]


