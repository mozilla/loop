# Loop Localization

## Background

Loop (aka Firefox Hello) contains two parts:

* A component that is built into, and shipped with Firefox desktop (also known
  as "link generator")
* A web page (also known as "Standalone" or "link clicker") that is hosted on a
  web server.

Releases to desktop and standalone happen every few weeks, however they are
not always in sync.

## Localizing Loop

Loop localization is via
[Pontoon](https://pontoon.mozilla.org/projects/firefox-hello/). If you wish to
help translate, please sign in there and suggest strings.

## Testing your latest Localization strings

Since releases only happen every few weeks, we have set up a development channel
for localisers to test the latest code and check their strings.

We have created a special add-on which gets updated about twice a week with the
latest code and localized strings.

*The add-on will override your installed Loop instance, and may cause any
Loop data you previously had to be lost (if you had not signed in).*

The add-on will create links to the development version of the standalone web pages.
These also include the latest strings and are updated every half hour.

To install the add-on:

* Visit the
[Firefox Hello Beta](https://addons.mozilla.org/firefox/addon/firefox-hello-beta/#beta-channel) page, and look for the `Development Channel` section
* Click the Yellow `Add to Firefox` button.
* Once downloaded, click `Install`
* **Restart Firefox**

You can then use the Loop icon on the toolbar to create rooms and check the strings
throughout the Firefox desktop UI.

When you get a room URL it will be for the development version of the standalone
web pages, and you should be able to load and view them in your language and check
the strings.
