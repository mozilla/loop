/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.shared = loop.shared || {};

// XXX akita: fix hard-code string
loop.shared.toc = (function(mozL10n) {
  "use strict";

  var ROOM_INFO_FAILURES = loop.shared.utils.ROOM_INFO_FAILURES;
  var ROOM_STATES = loop.store.ROOM_STATES;
  var sharedActions = loop.shared.actions;
  var sharedMixins = loop.shared.mixins;
  var sharedViews = loop.shared.views;
  var SCREEN_SHARE_STATES = loop.shared.utils.SCREEN_SHARE_STATES;

  // XXX akita: to store mixin
  // XXX akita: make activeRoomStore just handle the A/V connections.
  var TableOfContentView = React.createClass({
    mixins: [
      loop.store.StoreMixin("serverConnectionStore")
    ],

    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      isScreenShareActive: React.PropTypes.bool.isRequired,
      pageStore: React.PropTypes.instanceOf(loop.store.PageStore).isRequired,
      participantStore: React.PropTypes.instanceOf(loop.store.ParticipantStore).isRequired,
      snackbarStore: React.PropTypes.instanceOf(loop.store.SnackbarStore).isRequired
    },

    getInitialState: function() {
      return _.extend(this.getStoreState(), this._getPages());
    },

    _getPages: function() {
      return {
        pages: this.props.pageStore.getStoreState("pages")
      };
    },

    componentWillMount() {
      this.props.pageStore.on("change", () => {
        this.setState(this._getPages());
      }, this);
    },

    componentWillUnmount() {
      this.props.pageStore.off("change", null, this);
    },
    /**
     * Adds a new tile to the ToC
     */
    addTile: function(metadata) {
      var tiles = this.state.tiles;
      tiles.push({
        location: metadata.url,
        description: metadata.description,
        thumbnail_img: metadata.thumbnail_img
      });

      this.setState({
        tiles: tiles
      });
    },

    render: function() {
      var cssClasses = classNames({
        "toc-wrapper": true,
        "receiving-screen-share": this.props.isScreenShareActive
      });

      return (
        <div className={cssClasses}>
          <RoomInfoBarView
            dispatcher={this.props.dispatcher}
            isDesktop={loop.shared.utils.isDesktop()}
            participantStore={this.props.participantStore}
            roomName={this.state.roomName ? this.state.roomName
              : "BUG: NO NAME SPECIFIED"}
            roomToken={this.state.roomToken} />
          <RoomContentView
            pages={this.state.pages} />
          <SnackbarView
            snackbarStore={this.props.snackbarStore} />
        </div>
      );
    }
  });

  var RoomInfoBarView = React.createClass({
    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      isDesktop: React.PropTypes.bool.isRequired,
      participantStore: React.PropTypes.instanceOf(loop.store.ParticipantStore).isRequired,
      roomName: React.PropTypes.string.isRequired,
      roomToken: React.PropTypes.string.isRequired
    },

    componentWillReceiveProps: function(nextProps) {
      this.setState({
        roomName: nextProps.roomName || "#ROOM NAME"
      });
    },

    getInitialState: function() {
      return {
        roomName: this.props.roomName || "#ROOM NAME"
      };
    },

    exitEditMode: function(value) {
      this.props.dispatcher.dispatch(
        new sharedActions.UpdateRoomContext({
          roomToken: this.props.roomToken,
          newRoomName: value
        })
      );
    },

    render: function() {
      return (
        <div className="toc-room-info-bar">
          <div className="room-name">
            <sharedViews.EditableFieldView
              forceNotEditable={!this.props.isDesktop}
              label={this.state.roomName}
              onEditionComplete={this.exitEditMode} />
          </div>
          <RoomPresenceView
            participantStore={this.props.participantStore} />
          <RoomActionsView
            dispatcher={this.props.dispatcher} />
        </div>
      );
    }
  });

  var RoomPresenceView = React.createClass({
    propTypes: {
      participantStore: React.PropTypes.instanceOf(loop.store.ParticipantStore).isRequired
    },

    getInitialState() {
      return this._getOnlineParticipants();
    },

    _getOnlineParticipants() {
      return {
        participants: this.props.participantStore.getOnlineParticipants()
      };
    },

    componentWillMount() {
      this.props.participantStore.on("change", () => {
        this.setState(this._getOnlineParticipants());
      }, this);
    },

    componentWillUnmount() {
      this.props.participantStore.off("change", null, this);
    },

    render: function() {
      return (
        <div className="room-active-users">
          {
            this.state.participants.map(function(participant, index) {
              return (
                <div className="room-user" data-name={participant.participantName} key={index}>
                  <span>{participant.participantName[0].toUpperCase()}</span>
                </div>
              );
            })
          }
        </div>
      );
    }
  });

  var RoomActionsView = React.createClass({
    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired
    },

    getInitialState: function() {
      return {
        showAddUrlPanel: false
      };
    },

    // XXX akita: add jsdoc
    toggleAddUrlPanel: function() {
      this.setState({
        showAddUrlPanel: !this.state.showAddUrlPanel
      });
    },

    handleAddUrlClick: function(metadata) {
      this.toggleAddUrlPanel();
      this.props.dispatcher.dispatch(new sharedActions.AddPage(metadata));
    },

    render: function() {
      return (
        <div className="room-actions-buttons">
          <div className="room-action-add-url">
            <button className="add-url" onClick={this.toggleAddUrlPanel} />
            {
              this.state.showAddUrlPanel ?
                <AddUrlPanelView
                  dispatcher={this.props.dispatcher}
                  handleAddUrlClick={this.handleAddUrlClick} /> : null
            }
          </div>
          <div className="room-action-settings">
            <button className="settings" />
          </div>
        </div>
      );
    }
  });

  var AddUrlPanelView = React.createClass({
    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      handleAddUrlClick: React.PropTypes.func.isRequired
    },

    handleClick: function(event) {
      event.preventDefault();
      var input = this.refs.siteUrl;
      var url = input.value;

      if (!url) {
        return;
      }

      // XXX akita: Code below is just for testing purpose
      var btn = this.refs.addSiteBtn;
      btn.textContent = "Loading...";
      btn.disabled = true;

      loop.shared.utils.getPageMetadata(url).then(result => {
        this.props.dispatcher.dispatch(new sharedActions.ShowSnackbar({
          label: mozL10n.get("snackbar_page_added")
        }));
        this.props.handleAddUrlClick(result);
      }).catch(() => {
        // XXX akita: Code below is just for testing purpose
        btn.textContent = "Add site";
        btn.disabled = false;

        this.props.dispatcher.dispatch(new sharedActions.ShowSnackbar({
          label: mozL10n.get("snackbar_page_not_added")
        }));
      });
    },

    render: function() {
      return (
        <div className="room-panel-add-url">
          <h2>{'Add a site to the room'}</h2>
          <input placeholder="http://..." ref="siteUrl" type="text" />
          <button onClick={this.handleClick} ref="addSiteBtn">{'Add site'}</button>
        </div>
      );
    }
  });

  var RoomContentView = React.createClass({
    propTypes: {
      pages: React.PropTypes.array
    },

    getDefaultProps: function() {
      return {
        pages: []
      };
    },

    render: function() {
      return (
        <div className="room-toc">
          {
            this.props.pages.map(function(page, index) {
              return (
                <PageView
                  key={index}
                  page={page} />
              );
            }, this)
          }
        </div>
      );
    }
  });

  var PageView = React.createClass({
    propTypes: {
      page: React.PropTypes.object.isRequired
    },

    // XXX akita: add tile screenshot
    // XXX akita: follow-up -> how presence is handled on the UI
    render: function() {
      return (
        <div className="toc-tile">
          <div className="room-user" data-name={this.props.page.userName}>
            <span>{this.props.page.userName[0].toUpperCase()}</span>
          </div>
          <img className="tile-screenshot" src={this.props.page.thumbnail_img} />
          <div className="tile-info">
            <a
              className="tile-name"
              href={this.props.page.url}
              rel="noopener noreferrer"
              target="_blank"
              title={this.props.page.title}>
                {this.props.page.title}
            </a>
            <h3 className="tile-url">{this.props.page.url}</h3>
          </div>
        </div>
      );
    }
  });

  /* XXX akita-sidebar This is currently a fork of the standaloneRoomView.
   * As per discussion comments in the PR, we need to decide what,
   * if anything, to do about that.
   */
  var SidebarView = React.createClass({
    mixins: [
      Backbone.Events,
      sharedMixins.MediaSetupMixin,
      sharedMixins.RoomsAudioMixin,
      sharedMixins.DocumentTitleMixin
    ],

    propTypes: {
      // We pass conversationStore here rather than use the mixin, to allow
      // easy configurability for the ui-showcase.
      activeRoomStore: React.PropTypes.instanceOf(loop.store.ActiveRoomStore).isRequired,
      audio: React.PropTypes.object.isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      introSeen: React.PropTypes.bool,
      isFirefox: React.PropTypes.bool.isRequired,
      leaveRoom: React.PropTypes.func.isRequired,
      // The poster URLs are for UI-showcase testing and development
      localPosterUrl: React.PropTypes.string,
      remotePosterUrl: React.PropTypes.string,
      roomState: React.PropTypes.string,
      video: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
      // Uncomment this line to see the slideshow every time while developing:
      // localStorage.removeItem("introSeen");

      // Used by the UI showcase to override localStorage value to hide or show FTU slideshow.
      // localStorage sourced data is always string or null
      var introSeen = false;
      if (this.props.introSeen !== undefined) {
        if (this.props.introSeen) {
          introSeen = true;
        }
      } else if (localStorage.getItem("introSeen") !== null) {
        introSeen = true;
      }
      var storeState = this.props.activeRoomStore.getStoreState();
      return _.extend({}, storeState, {
        // Used by the UI showcase.
        roomState: this.props.roomState || storeState.roomState,
        introSeen: introSeen
      });
    },

    componentWillMount: function() {
      this.props.activeRoomStore.on("change", function() {
        this.setState(this.props.activeRoomStore.getStoreState());
      }, this);
    },

    componentWillUnmount: function() {
      this.props.activeRoomStore.off("change", null, this);
    },

    /**
     * Watches for when we transition to MEDIA_WAIT room state, so we can request
     * user media access.
     *
     * @param  {Object} nextProps (Unused)
     * @param  {Object} nextState Next state object.
     */
    componentWillUpdate: function(nextProps, nextState) {
      if (this.state.roomState !== ROOM_STATES.READY &&
          nextState.roomState === ROOM_STATES.READY) {
        var roomName = nextState.roomName;
        if (!roomName && nextState.roomContextUrls) {
          roomName = nextState.roomContextUrls[0].description ||
              nextState.roomContextUrls[0].location;
        }
        if (!roomName) {
          this.setTitle(mozL10n.get("clientShortname2"));
        } else {
          this.setTitle(mozL10n.get("standalone_title_with_room_name", {
            roomName: roomName,
            clientShortname: mozL10n.get("clientShortname2")
          }));
        }
      }

      if (this.state.roomState !== ROOM_STATES.MEDIA_WAIT &&
          nextState.roomState === ROOM_STATES.MEDIA_WAIT) {
        this.props.dispatcher.dispatch(new sharedActions.SetupStreamElements({
          publisherConfig: this.getDefaultPublisherConfig({ publishVideo: true })
        }));
      }

      // UX don't want to surface these errors (as they would imply the user
      // needs to do something to fix them, when if they're having a conversation
      // they just need to connect). However, we do want there to be somewhere to
      // find reasonably easily, in case there's issues raised.
      if (!this.state.roomInfoFailure && nextState.roomInfoFailure) {
        if (nextState.roomInfoFailure === ROOM_INFO_FAILURES.WEB_CRYPTO_UNSUPPORTED) {
          console.error(mozL10n.get("room_information_failure_unsupported_browser"));
        } else {
          console.error(mozL10n.get("room_information_failure_not_available"));
        }
      }
    },

    /**
     * Checks if current room is active.
     *
     * @return {Boolean}
     */
    _roomIsActive: function() {
      return this.state.roomState === ROOM_STATES.JOINED ||
             this.state.roomState === ROOM_STATES.SESSION_CONNECTED ||
             this.state.roomState === ROOM_STATES.HAS_PARTICIPANTS;
    },

    /**
     * Works out if remote video should be rended or not, depending on the
     * room state and other flags.
     *
     * @return {Boolean} True if remote video should be rended.
     *
     * XXX Refactor shouldRenderRemoteVideo & shouldRenderLoading to remove
     *     overlapping cases.
     */
    shouldRenderRemoteVideo: function() {
      switch (this.state.roomState) {
        case ROOM_STATES.HAS_PARTICIPANTS:
          if (this.state.remoteVideoEnabled) {
            return true;
          }

          if (this.state.mediaConnected) {
            // since the remoteVideo hasn't yet been enabled, if the
            // media is connected, then we should be displaying an avatar.
            return false;
          }

          return true;

        case ROOM_STATES.READY:
        case ROOM_STATES.GATHER:
        case ROOM_STATES.INIT:
        case ROOM_STATES.JOINING:
        case ROOM_STATES.SESSION_CONNECTED:
        case ROOM_STATES.JOINED:
        case ROOM_STATES.MEDIA_WAIT:
          // this case is so that we don't show an avatar while waiting for
          // the other party to connect
          return true;

        case ROOM_STATES.FAILED:
        case ROOM_STATES.CLOSING:
        case ROOM_STATES.FULL:
        case ROOM_STATES.ENDED:
          // the other person has shown up, so we don't want to show an avatar
          return true;

        default:
          console.warn("StandaloneRoomView.shouldRenderRemoteVideo:" +
            " unexpected roomState: ", this.state.roomState);
          return true;

      }
    },

    /**
     * Should we render a visual cue to the user (e.g. a spinner) that a local
     * stream is on its way from the camera?
     *
     * @returns {boolean}
     * @private
     */
    _isLocalLoading: function() {
      return this.state.roomState === ROOM_STATES.MEDIA_WAIT &&
             !this.state.localSrcMediaElement;
    },

    /**
     * Should we render a visual cue to the user (e.g. a spinner) that a remote
     * stream is on its way from the other user?
     *
     * @returns {boolean}
     * @private
     */
    _isRemoteLoading: function() {
      return !!(this.state.roomState === ROOM_STATES.HAS_PARTICIPANTS &&
                !this.state.remoteSrcMediaElement &&
                !this.state.mediaConnected);
    },

    // XXX akita display MediaLayoutView only if room has participants
    render: function() {
      return (
        <div className="sidebar-wrapper">
          <sharedViews.MediaLayoutView
            audio={this.props.audio}
            dispatcher={this.props.dispatcher}
            isLocalLoading={this._isLocalLoading()}
            isRemoteLoading={this._isRemoteLoading()}
            leaveRoom={this.props.leaveRoom}
            localPosterUrl={this.props.localPosterUrl}
            localSrcMediaElement={this.state.localSrcMediaElement}
            localVideoMuted={this.state.videoMuted}
            matchMedia={this.state.matchMedia || window.matchMedia.bind(window)}
            remotePosterUrl={this.props.remotePosterUrl}
            remoteSrcMediaElement={this.state.remoteSrcMediaElement}
            renderRemoteVideo={this.shouldRenderRemoteVideo()}
            screen={{ enabled: this.state.screenSharingState !== SCREEN_SHARE_STATES.INACTIVE }}
            showMediaWait={this.state.roomState === ROOM_STATES.MEDIA_WAIT}
            video={this.props.video} />
          <loop.shared.views.chat.TextChatView
            dispatcher={this.props.dispatcher}
            showInitialContext={true} />
        </div>
      );
    }
  });

  var SnackbarView = React.createClass({
    statics: {
      CLOSE_DELAY: 3000
    },

    propTypes: {
      snackbarStore: React.PropTypes.instanceOf(loop.store.SnackbarStore).isRequired
    },

    componentDidMount: function() {
      this.props.snackbarStore.on("change:label", this.handleStoreChange);
    },

    componentWillUnmount: function() {
      this.props.snackbarStore.off("change:label", this.handleStoreChange);
    },

    handleStoreChange: function() {
      this.setState(_.extend(this.props.snackbarStore.getStoreState(), {
        snackbarOpened: true
      }));

      setTimeout(() => {
        // Let's hide the snackbar
        this.setState({
          snackbarOpened: false
        });
      }, this.constructor.CLOSE_DELAY);
    },

    getInitialState: function() {
      return _.extend(this.props.snackbarStore.getStoreState(), {
        snackbarOpened: false
      });
    },

    render: function() {
      var cssClasses = {
        "snackbar": true,
        "open": this.state.snackbarOpened
      };

      return (
        <div className={classNames(cssClasses)}>
          <div className="snackbar-wrapper">
            <p>{this.state.label}</p>
          </div>
        </div>
      );
    }
  });

  return {
    AddUrlPanelView: AddUrlPanelView,
    SidebarView: SidebarView,
    RoomPresenceView: RoomPresenceView,
    TableOfContentView: TableOfContentView
  };
})(navigator.mozL10n || document.mozL10n);
