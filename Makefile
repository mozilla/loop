# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# Note that this Makefile is not invoked by the Mozilla build
# system, which is why it can have dependencies on things the
# build system at-large doesn't yet support.

LOOP_SERVER_URL := $(shell echo $${LOOP_SERVER_URL-http://localhost:5000/v0})
LOOP_FEEDBACK_API_URL := $(shell echo $${LOOP_FEEDBACK_API_URL-"https://input.allizom.org/api/v1/feedback"})
LOOP_FEEDBACK_PRODUCT_NAME := $(shell echo $${LOOP_FEEDBACK_PRODUCT_NAME-Loop})
LOOP_DOWNLOAD_FIREFOX_URL := $(shell echo $${LOOP_DOWNLOAD_FIREFOX_URL-"https://www.mozilla.org/firefox/new/?scene=2&utm_source=hello.firefox.com&utm_medium=referral&utm_campaign=non-webrtc-browser\#download-fx"})
LOOP_PRIVACY_WEBSITE_URL := $(shell echo $${LOOP_PRIVACY_WEBSITE_URL-"https://www.mozilla.org/privacy/firefox-hello/"})
LOOP_LEGAL_WEBSITE_URL := $(shell echo $${LOOP_LEGAL_WEBSITE_URL-"https://www.mozilla.org/about/legal/terms/firefox-hello/"})
LOOP_PRODUCT_HOMEPAGE_URL := $(shell echo $${LOOP_PRODUCT_HOMEPAGE_URL-"https://www.firefox.com/hello/"})
FIREFOX_VERSION=45.0

NODE_LOCAL_BIN := ./node_modules/.bin
REPO_BIN_DIR := ./bin
RSYNC := rsync --archive --exclude='*.jsx'

.PHONY: install
install: node_modules
	pip install -r require.pip

node_modules: package.json
	@mkdir -p node_modules
	npm install
	@touch node_modules

# build the dist dir, which contains a production version of the code and
# assets
.PHONY: dist
dist: build dist_xpi

.PHONY: distclean
distclean: clean
	rm -fr dist

.PHONY: distserver
distserver: remove_old_config dist
	LOOP_CONTENT_DIR=dist node server.js

BUILT := ./built
ADD-ON := add-on
BUILT_ADD_ON := $(BUILT)/$(ADD-ON)
DIST := ./dist
XPI_NAME := loop@mozilla.org.xpi
XPI_FILE := $(BUILT)/$(XPI_NAME)

VENV := $(BUILT)/.venv
BABEL := $(NODE_LOCAL_BIN)/babel --extensions '.jsx'
ESLINT := $(NODE_LOCAL_BIN)/eslint
FLAKE8 := $(NODE_LOCAL_BIN)/flake8

$(VENV): bin/require.pip
	virtualenv -p python2.7 $(VENV)
	. $(VENV)/bin/activate && pip install -r bin/require.pip

BACKBONE_OBJS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/backbone.js \
	$(BUILT)/standalone/content/shared/vendor/backbone.js \
	$(BUILT)/ui/shared/vendor/backbone.js

$(BACKBONE_OBJS): node_modules/backbone/backbone.js
	$(RSYNC) $< $@

CLASSNAME_OBJS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/classnames.js \
	$(BUILT)/standalone/content/shared/vendor/classnames.js \
	$(BUILT)/ui/shared/vendor/classnames.js

$(CLASSNAME_OBJS): node_modules/classnames/index.js
	$(RSYNC) $< $@

LODASH_OBJS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/lodash.js \
	$(BUILT)/standalone/content/shared/vendor/lodash.js \
	$(BUILT)/ui/shared/vendor/lodash.js

$(LODASH_OBJS): node_modules/lodash/index.js
	$(RSYNC) $< $@

REACT_OBJS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/react.js \
	$(BUILT)/standalone/content/shared/vendor/react.js \
	$(BUILT)/ui/shared/vendor/react.js

$(REACT_OBJS): node_modules/react/dist/react-with-addons.js
	$(RSYNC) $< $@

REACT_PROD_OBJECTS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/react-prod.js \
	$(BUILT)/standalone/content/shared/vendor/react-prod.js \
	$(BUILT)/ui/shared/vendor/react-prod.js

$(REACT_PROD_OBJECTS): node_modules/react/dist/react-with-addons.min.js
	$(RSYNC) $< $@

$(BUILT)/test/vendor:
	mkdir -p $@

$(BUILT)/test/vendor/sinon.js: node_modules/sinon/pkg/sinon.js
	$(RSYNC) $< $(BUILT)/test/vendor

$(BUILT)/test/vendor/mocha.%: node_modules/mocha/mocha.%
	$(RSYNC) $< $(BUILT)/test/vendor

$(BUILT)/test/vendor/chai.js: node_modules/chai/chai.js
	$(RSYNC) $< $(BUILT)/test/vendor

$(BUILT)/test/vendor/chai-as-promised.js: node_modules/chai-as-promised/lib/chai-as-promised.js
	$(RSYNC) $< $(BUILT)/test/vendor

.PHONY: vendor_libs
vendor_libs: $(BACKBONE_OBJS) $(CLASSNAME_OBJS) $(LODASH_OBJS) $(REACT_OBJS) \
             $(REACT_PROD_OBJECTS) \
             $(BUILT)/test/vendor $(BUILT)/test/vendor/sinon.js \
             $(BUILT)/test/vendor/mocha.js $(BUILT)/test/vendor/mocha.css \
             $(BUILT)/test/vendor/chai.js $(BUILT)/test/vendor/chai-as-promised.js

$(BUILT)/add-on/chrome/content/preferences/prefs.js: $(VENV) add-on/preferences/prefs.js
	mkdir -p $(@D)
	. $(VENV)/bin/activate && \
	  python $(VENV)/lib/python2.7/site-packages/mozbuild/preprocessor.py \
	         -D DEBUG=1 -o $@ add-on/preferences/prefs.js

$(DIST)/add-on/chrome/content/preferences/prefs.js: $(VENV) add-on/preferences/prefs.js
	mkdir -p $(@D)
	. $(VENV)/bin/activate && \
	  python $(VENV)/lib/python2.7/site-packages/mozbuild/preprocessor.py \
	         -o $@ add-on/preferences/prefs.js


# XXX maybe just build one copy of shared in standalone, and then use
# server.js magic to redirect?
# XXX ecma3 transform for IE?
.PHONY: ui
ui: node_modules
	mkdir -p $(BUILT)/$@
	$(RSYNC) $@ $(BUILT)
	$(BABEL) $@ --out-dir $(BUILT)/$@
	mkdir -p $(BUILT)/$@/shared
	$(RSYNC) shared $(BUILT)/$@
	$(BABEL) shared --out-dir $(BUILT)/$@/shared

.PHONY: standalone
standalone: node_modules
	mkdir -p $(BUILT)/$@
	$(RSYNC) $@ $(BUILT)
	$(BABEL) $@ --out-dir $(BUILT)/$@
	mkdir -p $(BUILT)/$@/content/shared
	$(RSYNC) shared $(BUILT)/$@/content
	$(BABEL) shared --out-dir $(BUILT)/$@/content/shared
	mkdir -p $(BUILT)/$@/content/l10n/en-US
	cat locale/en-US/$@.properties locale/en-US/shared.properties > $(BUILT)/$@/content/l10n/en-US/loop.properties

.PHONY: add-on
add-on: node_modules $(BUILT)/$(ADD-ON)/chrome.manifest $(BUILT)/add-on/chrome/content/preferences/prefs.js
	mkdir -p $(BUILT)/$@
	$(RSYNC) $@/chrome/bootstrap.js $(BUILT)/$@
	sed "s/@FIREFOX_VERSION@/$(FIREFOX_VERSION)/g" add-on/install.rdf.in | \
		grep -v "#filter substitution" > $(BUILT)/$@/install.rdf
	mkdir -p $(BUILT)/$@/chrome/content/panels
	$(RSYNC) $@/panels $(BUILT)/$@/chrome/content
	$(BABEL) $@/panels --out-dir $(BUILT)/$@/chrome/content/panels
	mkdir -p $(BUILT)/$@/chrome/content/modules
	$(RSYNC) $@/chrome/modules $(BUILT)/$@/chrome/content
	mkdir -p $(BUILT)/$@/chrome/test
	$(RSYNC) $@/chrome/test $(BUILT)/$@/chrome
	mkdir -p $(BUILT)/$@/chrome/content/shared
	$(RSYNC) shared $(BUILT)/$@/chrome/content
	$(BABEL) shared --out-dir $(BUILT)/$@/chrome/content/shared
	$(RSYNC) $@/chrome/skin $(BUILT)/$@/chrome/
	mkdir -p $(BUILT)/$@/chrome/locale/en-US
	cat locale/en-US/$@.properties locale/en-US/shared.properties > $(BUILT)/$@/chrome/locale/en-US/loop.properties

$(BUILT)/$(ADD-ON)/chrome.manifest: $(ADD-ON)/jar.mn
	mkdir -p $(BUILT)/$(ADD-ON)
	sed -n -e '/^%/p' $(ADD-ON)/jar.mn | \
	sed -e "s/^% //g" | sed -e "s/%/chrome\//g" \
	> $(BUILT)/$(ADD-ON)/chrome.manifest

# In this RSYNC, the order of exclude and includes generally matters.
# The items below are:
# - Don't copy prefs.js as we generate that in the dependencies.
# - Copy all the relevant js, html, css etc files that we need.
# - Copy the add-on "support files".
# - Exclude all other files.
# - Exclude all test files.
# - Exclude and editor temp files.
RSYNC_DIST := $(RSYNC) -r \
  --exclude="**/prefs.js" \
  --include="*.jsm" --include="*.js" \
  --include="*.html" --include="*.css" \
  --include="*.ogg" --include="*.svg" --include="*.png" --include="*.gif" \
  --include="*.properties" --include="*.manifest" --include="*.rdf" \
  --exclude="*.*" --exclude "**/test" --exclude "*~"

.PHONY: add-on_dist
add-on_dist: $(DIST)/add-on/chrome/content/preferences/prefs.js
	mkdir -p $(DIST)/add-on
	# Copy just the files we need.
	$(RSYNC_DIST) $(BUILT_ADD_ON)/ $(DIST)/add-on/
	mv $(DIST)/add-on/chrome/content/shared/vendor/react-prod.js \
	   $(DIST)/add-on/chrome/content/shared/vendor/react.js

.PHONY: standalone_dist
standalone_dist:
	mkdir -p $(DIST)
	$(RSYNC) content/* $(DIST)
	NODE_ENV="production" $(NODE_LOCAL_BIN)/webpack \
	  -p -v --display-errors
	sed 's#webappEntryPoint.js#js/standalone.js#' \
	  < content/index.html > $(DIST)/index.html

# so we can type "make xpi" without depend on the file directly
.PHONY: xpi
xpi: $(XPI_FILE)

$(XPI_FILE): $(REPO_BIN_DIR)/build_extension.sh build
	@$(REPO_BIN_DIR)/build_extension.sh $(XPI_NAME) $(BUILT) add-on

.PHONY: dist_xpi
dist_xpi: add-on_dist
	rm -f $(DIST)/$(XPI_NAME)
	@$(REPO_BIN_DIR)/build_extension.sh $(XPI_NAME) $(DIST) add-on

#
# Tests
#

eslint:
	$(ESLINT) --ext .js --ext .jsm --ext .jsx .

flake8: $(VENV)
	. $(VENV)/bin/activate && flake8 .

.PHONY: lint
lint: eslint flake8

karma: build
	$(NODE_LOCAL_BIN)/karma start test/karma/karma.coverage.desktop.js
	$(NODE_LOCAL_BIN)/karma start test/karma/karma.coverage.shared_standalone.js


#
# Build & run
#

.PHONY: build
build: add-on standalone ui vendor_libs

.PHONY: clean
clean:
	rm -rf $(BUILT)

.PHONY: cleanbuild
cleanbuild: clean build

test: lint karma

.PHONY: runserver
runserver: remove_old_config
	$(REPO_BIN_DIR)/run-server.sh

.PHONY: runfx
runfx:
	bin/runfx.js ${ARGS}

frontend:
	@echo "Not implemented yet."

# Try hg first, if not fall back to git.
SOURCE_STAMP := $(shell hg parent --template '{node|short}\n' 2> /dev/null)
ifndef SOURCE_STAMP
SOURCE_STAMP := $(shell git describe --always --tag)
endif

SOURCE_DATE := $(shell hg parent --template '{date|date}\n' 2> /dev/null)
ifndef SOURCE_DATE
SOURCE_DATE := $(shell git log -1 --format="%H%n%aD")
endif

version:
	@echo $(SOURCE_STAMP) > content/VERSION.txt
	@echo $(SOURCE_DATE) >> content/VERSION.txt


# The local node server used for client dev (server.js) used to use a static
# content/config.js.  Now that information is server up dynamically.  This
# target is depended on by runserver, and removes any copies of that to avoid
# confusion.
remove_old_config:
	@rm -f content/config.js


# The services development deployment, however, still wants a static config
# file, and needs an easy way to generate one.  This target is for folks
# working with that deployment.
.PHONY: config
config:
	@echo "var loop = loop || {};" > content/config.js
	@echo "loop.config = loop.config || {};" >> content/config.js
	@echo "loop.config.serverUrl = '`echo $(LOOP_SERVER_URL)`';" >> content/config.js
	@echo "loop.config.feedbackApiUrl = '`echo $(LOOP_FEEDBACK_API_URL)`';" >> content/config.js
	@echo "loop.config.feedbackProductName = '`echo $(LOOP_FEEDBACK_PRODUCT_NAME)`';" >> content/config.js
	@echo "loop.config.downloadFirefoxUrl = '`echo $(LOOP_DOWNLOAD_FIREFOX_URL)`';" >> content/config.js
	@echo "loop.config.privacyWebsiteUrl = '`echo $(LOOP_PRIVACY_WEBSITE_URL)`';" >> content/config.js
	@echo "loop.config.legalWebsiteUrl = '`echo $(LOOP_LEGAL_WEBSITE_URL)`';" >> content/config.js
	@echo "loop.config.learnMoreUrl = '`echo $(LOOP_PRODUCT_HOMEPAGE_URL)`';" >> content/config.js
	@echo "loop.config.roomsSupportUrl = 'https://support.mozilla.org/kb/group-conversations-firefox-hello-webrtc';" >> content/config.js
	@echo "loop.config.guestSupportUrl = 'https://support.mozilla.org/kb/respond-firefox-hello-invitation-guest-mode';" >> content/config.js
	@echo "loop.config.generalSupportUrl = 'https://support.mozilla.org/kb/respond-firefox-hello-invitation-guest-mode';" >> content/config.js
	@echo "loop.config.tilesIframeUrl = 'https://tiles.cdn.mozilla.net/iframe.html';" >> content/config.js
	@echo "loop.config.tilesSupportUrl = 'https://support.mozilla.org/tiles-firefox-hello';" >> content/config.js
	@echo "loop.config.unsupportedPlatformUrl = 'https://support.mozilla.org/en-US/kb/which-browsers-will-work-firefox-hello-video-chat';" >> content/config.js
