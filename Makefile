# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# Note that this Makefile is not invoked by the Mozilla build
# system, which is why it can have dependencies on things the
# build system at-large doesn't yet support.

LOOP_SERVER_URL := $(shell echo $${LOOP_SERVER_URL-http://localhost:5000/v0})
LOOP_DOWNLOAD_FIREFOX_URL := $(shell echo $${LOOP_DOWNLOAD_FIREFOX_URL-"https://www.mozilla.org/firefox/new/?scene=2&utm_source=hello.firefox.com&utm_medium=referral&utm_campaign=non-webrtc-browser\#download-fx"})
LOOP_PRIVACY_WEBSITE_URL := $(shell echo $${LOOP_PRIVACY_WEBSITE_URL-"https://www.mozilla.org/privacy/firefox-hello/"})
LOOP_LEGAL_WEBSITE_URL := $(shell echo $${LOOP_LEGAL_WEBSITE_URL-"https://www.mozilla.org/about/legal/terms/firefox-hello/"})
LOOP_PRODUCT_HOMEPAGE_URL := $(shell echo $${LOOP_PRODUCT_HOMEPAGE_URL-"https://www.firefox.com/hello/"})
# This should always be a nn.* version, so that the add-on is compatible with not
# only the release but any security/stability releases as well.
# Note that MOZ_APP_MAXVERSION is the variable name used by mozilla-central.
MOZ_APP_MAXVERSION=48.*

# Work around for realpath not working as expected
NODE_LOCAL_BIN := $(abspath ./node_modules/.bin)
REPO_BIN_DIR := ./bin
RSYNC := rsync --archive --exclude='*.jsx'

.PHONY: install
install: node_modules

node_modules: package.json
	@mkdir -p node_modules
	npm install
	@touch node_modules

# build the dist dir, which contains a production version of the code and
# assets
.PHONY: dist
dist: build dist_xpi dist_export dist_standalone

.PHONY: distclean
distclean: clean
	rm -rf dist
	rm -rf node_modules

.PHONY: distserver
distserver: remove_old_config dist_standalone
	LOOP_CONTENT_DIR=`pwd`/dist/standalone node bin/server.js

BUILT := ./built
ADD-ON := add-on
BUILT_ADD_ON := $(BUILT)/$(ADD-ON)
DIST := ./dist
DIST_EXPORT_DIR := ./dist/export-gecko
XPI_NAME := loop@mozilla.org.xpi
XPI_FILE := $(BUILT)/$(XPI_NAME)

VENV := $(BUILT)/.venv
BABEL := $(NODE_LOCAL_BIN)/babel
ESLINT := $(NODE_LOCAL_BIN)/eslint
FLAKE8 := $(NODE_LOCAL_BIN)/flake8

# For building a dev xpi, set this in the environment/on the command line, e.g.
# `DEV_XPI=1 make build`.
ifdef DEV_XPI
LOOP_XPI_DATE=`date +"%Y%m%d%H%M"`
LOOP_DEV_XPI_DEFS=-D LOOP_DEV_XPI=1
else
LOOP_XPI_DATE=
LOOP_DEV_XPI_DEFS=
endif

# In the PACKAGE_VERSION below we:
# - parse package.json
# - get the lines with version in
# - reduce to just the first of those lines
# - strip out space, " and ,
# - get the real version number (e.g. version:0.1.0 -> 0.1.0)
# - change 0.1.0-alpha to 0.1.0alpha for AMO compatiblity
PACKAGE_VERSION := $(shell grep -m1 version package.json | \
	cut -d'"' -f4 | \
	sed 's/-alpha/alpha/')

.PHONY: generate_changelog
generate_changelog: $(VENV)
	@# Hack around pystache not installing things in the correct places
	@mkdir -p $(VENV)/lib/python2.7/site-packages/templates/mustache
	@$(RSYNC) $(VENV)/templates/mustache $(VENV)/lib/python2.7/site-packages/templates
	@$(VENV)/bin/gitchangelog | sed -e 's/%%version%% (unreleased)/${PACKAGE_VERSION}/' > CHANGELOG.md
	@git add CHANGELOG.md

.PHONY: change_versions
change_versions:
	@# Ubuntu's version of sed doesn't have -i
	@sed -e 's/<em:version>.*<\/em:version>/<em:version>$(PACKAGE_VERSION)@LOOP_XPI_DATE@<\/em:version>/' \
	    $(ADD-ON)/install.rdf.in > $(ADD-ON)/install.rdf.in.gen
	@mv $(ADD-ON)/install.rdf.in.gen $(ADD-ON)/install.rdf.in
	@# Add package.json for the case where `npm version` is used with
	@# `--no-git-tag-version` - to make it easier to commit.
	@git add $(ADD-ON)/install.rdf.in package.json

# Commands need to update the versions correctly in all places. Called from
# npm's version command as configured in package.json
.PHONY: update_version
update_version: change_versions

# Don't generate the changelog for alpha versions, which is more like a rolling tag.
ifneq ($(findstring alpha,$(PACKAGE_VERSION)),alpha)
update_version: generate_changelog
endif

$(VENV): bin/require.pip
	virtualenv -p python2.7 $(VENV)
	. $(VENV)/bin/activate && pip install -r bin/require.pip

#
# Pull in our vendor libraries from node_modules
#
BACKBONE_OBJS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/backbone.js \
	$(BUILT)/standalone/content/shared/vendor/backbone.js \
	$(BUILT)/ui/shared/vendor/backbone.js

$(BACKBONE_OBJS): node_modules/backbone/backbone.js
	@mkdir -p $(@D)
	$(RSYNC) $< $@

CLASSNAME_OBJS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/classnames.js \
	$(BUILT)/standalone/content/shared/vendor/classnames.js \
	$(BUILT)/ui/shared/vendor/classnames.js

$(CLASSNAME_OBJS): node_modules/classnames/index.js
	@mkdir -p $(@D)
	$(RSYNC) $< $@

LODASH_OBJS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/lodash.js \
	$(BUILT)/standalone/content/shared/vendor/lodash.js \
	$(BUILT)/ui/shared/vendor/lodash.js

$(LODASH_OBJS): node_modules/lodash/index.js
	@mkdir -p $(@D)
	$(RSYNC) $< $@

REACT_OBJS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/react.js \
	$(BUILT)/standalone/content/shared/vendor/react.js \
	$(BUILT)/ui/shared/vendor/react.js

$(REACT_OBJS): node_modules/react/dist/react-with-addons.js
	@mkdir -p $(@D)
	$(RSYNC) $< $@

REACT_DOM_OBJS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/react-dom.js \
  $(BUILT)/standalone/content/shared/vendor/react-dom.js \
	$(BUILT)/ui/shared/vendor/react-dom.js

$(REACT_DOM_OBJS): node_modules/react-dom/dist/react-dom.js
	$(RSYNC) $< $@

REACT_PROD_OBJECTS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/react-prod.js \
	$(BUILT)/standalone/content/shared/vendor/react-prod.js \
	$(BUILT)/ui/shared/vendor/react-prod.js

$(REACT_PROD_OBJECTS): node_modules/react/dist/react-with-addons.min.js
	@mkdir -p $(@D)
	$(RSYNC) $< $@

REACT_DOM_PROD_OBJECTS = \
	$(BUILT)/add-on/chrome/content/shared/vendor/react-dom-prod.js \
	$(BUILT)/standalone/content/shared/vendor/react-dom-prod.js \
	$(BUILT)/ui/shared/vendor/react-dom-prod.js

$(REACT_DOM_PROD_OBJECTS): node_modules/react-dom/dist/react-dom.min.js
	$(RSYNC) $< $@

$(BUILT)/test/vendor:
	mkdir -p $@

$(BUILT)/test/vendor/sinon.js: node_modules/sinon/pkg/sinon.js
	$(RSYNC) $< $(BUILT)/test/vendor

$(BUILT)/test/vendor/mocha.js: node_modules/mocha/mocha.js
	$(RSYNC) $< $(BUILT)/test/vendor

$(BUILT)/test/vendor/mocha.css: node_modules/mocha/mocha.css
	$(RSYNC) $< $(BUILT)/test/vendor

$(BUILT)/test/vendor/chai.js: node_modules/chai/chai.js
	$(RSYNC) $< $(BUILT)/test/vendor

$(BUILT)/test/vendor/chai-as-promised.js: node_modules/chai-as-promised/lib/chai-as-promised.js
	$(RSYNC) $< $(BUILT)/test/vendor

$(BUILT)/test/vendor/react-dom-server.js: node_modules/react-dom/dist/react-dom-server.js
	$(RSYNC) $< $(@D)

.PHONY: vendor_libs
vendor_libs: $(BACKBONE_OBJS) $(CLASSNAME_OBJS) $(LODASH_OBJS) $(REACT_OBJS) \
             $(REACT_DOM_OBJS) \
             $(REACT_PROD_OBJECTS) \
             $(REACT_DOM_PROD_OBJECTS) \
             $(BUILT)/test/vendor $(BUILT)/test/vendor/sinon.js \
             $(BUILT)/test/vendor/mocha.js $(BUILT)/test/vendor/mocha.css \
             $(BUILT)/test/vendor/chai.js $(BUILT)/test/vendor/chai-as-promised.js \
             $(BUILT)/test/vendor/react-dom-server.js

$(BUILT)/add-on/chrome/content/preferences/prefs.js: add-on/preferences/prefs.js \
                                                     $(VENV) \
                                                     Makefile
	mkdir -p $(@D)
	. $(VENV)/bin/activate && \
	  python $(VENV)/lib/python2.7/site-packages/mozbuild/preprocessor.py \
	         -D DEBUG=1 -D LOOP_BETA=1 $(LOOP_DEV_XPI_DEFS) \
	         -o $@ $<

$(DIST)/add-on/chrome/content/preferences/prefs.js: add-on/preferences/prefs.js \
                                                    $(VENV) \
                                                    Makefile
	mkdir -p $(@D)
	. $(VENV)/bin/activate && \
	  python $(VENV)/lib/python2.7/site-packages/mozbuild/preprocessor.py \
	         -D LOOP_BETA=1 $(LOOP_DEV_XPI_DEFS) \
	         -o $@ $<

$(BUILT)/add-on/install.rdf: add-on/install.rdf.in \
                             $(VENV) \
                             Makefile
	@mkdir -p $(@D)
	. $(VENV)/bin/activate && \
	  python $(VENV)/lib/python2.7/site-packages/mozbuild/preprocessor.py \
	         -D MOZ_APP_MAXVERSION=$(MOZ_APP_MAXVERSION) \
	         -D LOOP_XPI_DATE=$(LOOP_XPI_DATE) \
	         -o $@ $<


# Build our jsx files into appropriately placed js files.  Note that the rules
# are somewhat repetitive, and less elegant than they might be.  We _could_
# use more terse make syntax here, but the idea is that it's better to
# keep the feel readable/maintainable by non Make-experts, even at the cost
# of some repetition.

# The shared files currently get built once for each destination; we could
# optimize this away.  We used the shared_jsx_temporary to make this code more
# readable.
shared_jsx_files=$(wildcard shared/js/*.jsx)
built_ui_shared_js_files=$(shared_jsx_files:%.jsx=$(BUILT)/ui/%.js)
built_add_on_shared_js_files=$(shared_jsx_files:%.jsx=$(BUILT)/add-on/chrome/content/%.js)
built_standalone_shared_js_files=$(shared_jsx_files:%.jsx=$(BUILT)/standalone/content/%.js)

# We can't use $(shared_jsx_files) here because % rules don't accept that.
$(BUILT)/standalone/content/shared/js/%.js: shared/js/%.jsx
	@mkdir -p $(@D)
	$(BABEL) $< --out-file $@

# We can't use $(shared_jsx_files) here because % rules don't accept that.
$(BUILT)/add-on/chrome/content/shared/js/%.js: shared/js/%.jsx
	@mkdir -p $(@D)
	$(BABEL) $< --out-file $@

# We can't use $(shared_jsx_files) here because % rules don't accept that.
$(BUILT)/ui/shared/js/%.js: shared/js/%.jsx
	@mkdir -p $(@D)
	$(BABEL) $< --out-file $@

#
# The following sections are for the non-shared assets:
#

# ui-showcase
ui_jsx_files=$(wildcard ui/*.jsx)
built_ui_js_files=$(ui_jsx_files:%.jsx=$(BUILT)/%.js)

$(BUILT)/ui/%.js: ui/%.jsx
	@mkdir -p $(@D)
	$(BABEL) $< --out-file $@

# standalone
standalone_jsx_files=$(wildcard standalone/content/js/*.jsx)
built_standalone_js_files=$(standalone_jsx_files:%.jsx=$(BUILT)/%.js)

$(BUILT)/standalone/content/js/%.js: standalone/content/js/%.jsx
	@mkdir -p $(@D)
	$(BABEL) $< --out-file $@

standalone_l10n_files=$(wildcard locale/*/standalone.properties)
built_standalone_l10n_files=$(patsubst locale/%/standalone.properties, \
	$(BUILT)/standalone/content/l10n/%/loop.properties, \
	$(standalone_l10n_files))

$(BUILT)/standalone/content/l10n/%/loop.properties: locale/%/standalone.properties locale/%/shared.properties
	@mkdir -p $(@D)
	cat $^ > $@

# add-on
add_on_jsx_files=$(wildcard add-on/panels/js/*.jsx)
built_add_on_js_files=$(patsubst add-on/panels/js/%.jsx, \
	 $(BUILT)/add-on/chrome/content/panels/js/%.js, \
	 $(add_on_jsx_files))

$(BUILT)/add-on/chrome/content/panels/js/%.js: add-on/panels/js/%.jsx
	@mkdir -p $(@D)
	$(BABEL) $< --out-file $@

add_on_vendor_jsx_files=$(wildcard add-on/panels/vendor/*.jsx)
built_add_on_vendor_js_files=$(patsubst add-on/panels/vendor/%.jsx, \
	 $(BUILT)/add-on/chrome/content/panels/vendor/%.js, \
	 $(add_on_vendor_jsx_files))

$(BUILT)/add-on/chrome/content/panels/vendor/%.js: add-on/panels/vendor/%.jsx
	@mkdir -p $(@D)
	$(BABEL) $< --out-file $@

add_on_l10n_files=$(wildcard locale/*/add-on.properties)
built_add_on_l10n_files=$(patsubst locale/%/add-on.properties, \
	$(BUILT)/add-on/chrome/locale/%/loop.properties, \
	$(add_on_l10n_files))

$(BUILT)/add-on/chrome/locale/%/loop.properties: locale/%/add-on.properties locale/%/shared.properties
	@mkdir -p $(@D)
	cat $^ > $@

# XXX maybe just build one copy of shared in standalone, and then use
# server.js magic to redirect?
# XXX ecma3 transform for IE?
.PHONY: ui
ui: node_modules $(built_ui_js_files) $(built_ui_shared_js_files) vendor_libs
	mkdir -p $(BUILT)/$@
	$(RSYNC) $@ $(BUILT)
	mkdir -p $(BUILT)/$@/shared
	$(RSYNC) shared $(BUILT)/$@

.PHONY: standalone
standalone: node_modules \
            vendor_libs \
            $(BACKBONE_OBJS) \
            $(LODASH_OBJS) \
            $(built_standalone_js_files) \
            $(built_standalone_shared_js_files) \
            $(built_standalone_l10n_files)
	mkdir -p $(BUILT)/$@
	$(RSYNC) $@ $(BUILT)
	mkdir -p $(BUILT)/$@/content/shared
	$(RSYNC) shared $(BUILT)/$@/content

.PHONY: add-on
add-on: node_modules \
	      vendor_libs \
	      $(built_add_on_js_files) \
	      $(built_add_on_shared_js_files) \
	      $(built_add_on_vendor_js_files) \
	      $(built_add_on_l10n_files) \
	      $(BUILT)/$(ADD-ON)/chrome.manifest \
	      $(BUILT)/$(ADD-ON)/chrome/locale/chrome.manifest \
	      $(BUILT)/$(ADD-ON)/install.rdf \
	      $(BUILT)/add-on/chrome/content/preferences/prefs.js
	mkdir -p $(BUILT)/$@
	$(RSYNC) $@/chrome/bootstrap.js $(BUILT)/$@
	mkdir -p $(BUILT)/$@/chrome/content/panels
	$(RSYNC) $@/panels $(BUILT)/$@/chrome/content
	mkdir -p $(BUILT)/$@/chrome/content/modules
	$(RSYNC) $@/chrome/modules $(BUILT)/$@/chrome/content
	mkdir -p $(BUILT)/$@/chrome/test
	$(RSYNC) $@/chrome/test $(BUILT)/$@/chrome
	mkdir -p $(BUILT)/$@/chrome/content/shared
	$(RSYNC) shared $(BUILT)/$@/chrome/content
	$(RSYNC) $@/chrome/skin $(BUILT)/$@/chrome/

$(BUILT)/$(ADD-ON)/chrome.manifest: $(ADD-ON)/jar.mn
	@mkdir -p $(@D)
	python bin/generateChromeManifest.py --input-file=$^ --output-file=$@

shared_l10n_files=$(wildcard locale/*/shared.properties)
$(BUILT)/$(ADD-ON)/chrome/locale/chrome.manifest: $(add_on_l10n_files) $(shared_l10n_files)
	@mkdir -p $(@D)
	python bin/generateLocaleManifest.py --output-file=$@ --src=locale

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
add-on_dist: add-on $(DIST)/add-on/chrome/content/preferences/prefs.js
	mkdir -p $(DIST)/add-on
	# Copy just the files we need.
	$(RSYNC_DIST) $(BUILT_ADD_ON)/ $(DIST)/add-on/
	mv $(DIST)/add-on/chrome/content/shared/vendor/react-prod.js \
	   $(DIST)/add-on/chrome/content/shared/vendor/react.js

.PHONY: dist_standalone
dist_standalone: standalone
	mkdir -p $(DIST)/standalone
	# Standalone based on the built output
	$(RSYNC) $(BUILT)/standalone/content/* $(DIST)/standalone
	# Removing non-required JS files
	rm -rf $(DIST)/standalone/js/ $(DIST)/standalone/shared/js \
		$(DIST)/standalone/shared/vendor
	( cd built/standalone && NODE_ENV="production" $(NODE_LOCAL_BIN)/webpack \
		-p -v --display-errors )
	sed 's#webappEntryPoint.js#js/standalone.js#' \
		< $(BUILT)/standalone/content/index.html > $(DIST)/standalone/index.html
	# Now create a version file.
	@git describe --always --tag > $(DIST)/standalone/VERSION.txt
	@git log -1 --format="%H%n%aD" >> $(DIST)/standalone/VERSION.txt

# so we can type "make xpi" without depend on the file directly
.PHONY: xpi
xpi: $(XPI_FILE)

$(XPI_FILE): $(REPO_BIN_DIR)/build_extension.sh build
	@$(REPO_BIN_DIR)/build_extension.sh $(XPI_NAME) $(BUILT) add-on

.PHONY: dist_xpi
dist_xpi: add-on_dist
	rm -f $(DIST)/$(XPI_NAME)
	@$(REPO_BIN_DIR)/build_extension.sh $(XPI_NAME) $(DIST) add-on

.PHONY: dist_export
dist_export:
	rm -rf $(DIST_EXPORT_DIR)
	@mkdir -p $(DIST_EXPORT_DIR)
	# Do a basic copy of the add-on.
	$(RSYNC) $(BUILT)/$(ADD-ON)/* $(DIST_EXPORT_DIR)
	# Use a modified install.rdf.in rather than install.rdf.
	rm -f $(DIST_EXPORT_DIR)/install.rdf
	# mozilla-central and other Firefox repositories don't need the date field.
	@sed -e 's/@LOOP_XPI_DATE@//' $(ADD-ON)/install.rdf.in | \
	  sed -e 's/Firefox Hello Beta/Firefox Hello/' > \
	    $(DIST_EXPORT_DIR)/install.rdf.in
	# jar.mn is used for Firefox build
	rm -f $(DIST_EXPORT_DIR)/chrome.manifest
	rm -f $(DIST_EXPORT_DIR)/chrome/locale/chrome.manifest
	# Add the jar files.
	$(RSYNC) $(ADD-ON)/jar.mn $(DIST_EXPORT_DIR)
	$(RSYNC) locale/jar.mn $(DIST_EXPORT_DIR)/chrome/locale
	# Use the original prefs.js.
	$(RSYNC) $(ADD-ON)/preferences/prefs.js $(DIST_EXPORT_DIR)/chrome/content/preferences/prefs.js
	# Copy the vendor files that support the unit tests.
	$(RSYNC) $(BUILT)/test/vendor/* $(DIST_EXPORT_DIR)/chrome/content/shared/test/vendor
	# and the functional tests.
	@mkdir -p $(DIST_EXPORT_DIR)/test/functional
	$(RSYNC) test/functional/* $(DIST_EXPORT_DIR)/test/functional

.PHONY: update_locale
update_locale: $(VENV)
	$(VENV)/bin/python bin/locale_update.py

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

# Which test server to run against. Defaults to the dev server so that anyone
# can run the tests. Possible values: local, dev, stage, production.
TEST_SERVER := $(shell echo $${TEST_SERVER-dev})

# Defaults to using the local standalone. If 0 will use the standalone associated
# with the server defined by TEST_SERVER.
USE_LOCAL_STANDALONE := $(shell echo $${USE_LOCAL_STANDALONE-1})

# Path to the local loop server. Only used if TEST_SERVER=local.
LOOP_SERVER := $(shell echo $${LOOP_SERVER-../loop-server})

# Either path to the browser, or one of nightly, aurora, beta, firefox.
TEST_BROWSER := $(shell echo $${TEST_BROWSER-nightly})

ifdef TEST_E10S
E10S_ARGS = --e10s
endif

.PHONY: functional
ifeq ($(SKIP_FUNCTIONAL),1)
functional:
	# Do nothing.
else
functional: build $(XPI_FILE)
	@mkdir -p $(BUILT)/functional
	TEST_SERVER=$(TEST_SERVER) \
	 LOOP_SERVER=$(LOOP_SERVER) \
	 USE_LOCAL_STANDALONE=$(USE_LOCAL_STANDALONE) \
	 LOOP_XPI_FILE=$(XPI_FILE) \
	$(VENV)/bin/marionette --binary `./bin/getfx.js -b $(TEST_BROWSER)` \
	                       --type=browser \
	                       --gecko-log $(BUILT)/functional/gecko.log \
	                       $(E10S_ARGS) \
	                       test/functional/manifest.ini
endif

#
# Build & run
#

.PHONY: build
build: add-on standalone ui

GIT_EXPORT_LOCATION := $(shell echo $${GIT_EXPORT_LOCATION-../gecko-dev})
GIT_EXPORT_DIR := $(GIT_EXPORT_LOCATION)/browser/extensions/loop

ifeq ($(shell uname -s),Linux)
  FIND_COMMAND := find $(GIT_EXPORT_DIR) -regextype posix-extended
else
  FIND_COMMAND := find -E $(GIT_EXPORT_DIR)
endif

.PHONY: git-export
git-export: build dist_export
	$(FIND_COMMAND) -type f ! -regex \
	  '.*/(moz.build|README.txt|.gitignore|run-all-loop-tests.sh|manifest.ini)' -delete
	$(RSYNC) $(DIST_EXPORT_DIR)/* $(GIT_EXPORT_DIR)

	@echo "*****"
	@echo "You will need to manually move/add/remove files to create the commit."
	@echo "*****"

.PHONY: clean
clean:
	rm -rf $(BUILT)

.PHONY: cleanbuild
cleanbuild: clean build

test: lint karma functional

.PHONY: runserver
runserver: remove_old_config
	$(REPO_BIN_DIR)/run-server.sh

.PHONY: runserver_nowatch
runserver_nowatch:
	node bin/server.js

.PHONY: runfx
runfx:
	bin/runfx.js ${ARGS}

frontend:
	@echo "Not implemented yet."

.PHONY: upload_xpi
upload_xpi:
	@if [[ -z "${JPM_API_KEY}" || -z "${JPM_API_SECRET}" ]]; then \
	  echo "JPM_API_KEY and JPM_API_SECRET should be defined"; \
	  exit 1; \
	  fi
	$(NODE_LOCAL_BIN)/jpm sign --api-key=${JPM_API_KEY} --api-secret=${JPM_API_SECRET} \
	  --xpi $(DIST)/$(XPI_NAME)

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
	@echo "loop.config.downloadFirefoxUrl = '`echo $(LOOP_DOWNLOAD_FIREFOX_URL)`';" >> content/config.js
	@echo "loop.config.privacyWebsiteUrl = '`echo $(LOOP_PRIVACY_WEBSITE_URL)`';" >> content/config.js
	@echo "loop.config.legalWebsiteUrl = '`echo $(LOOP_LEGAL_WEBSITE_URL)`';" >> content/config.js
	@echo "loop.config.learnMoreUrl = '`echo $(LOOP_PRODUCT_HOMEPAGE_URL)`';" >> content/config.js
	@echo "loop.config.generalSupportUrl = 'https://support.mozilla.org/kb/respond-firefox-hello-invitation-guest-mode';" >> content/config.js
	@echo "loop.config.tilesIframeUrl = 'https://tiles.cdn.mozilla.net/iframe.html';" >> content/config.js
	@echo "loop.config.tilesSupportUrl = 'https://support.mozilla.org/kb/tiles-firefox-hello';" >> content/config.js
