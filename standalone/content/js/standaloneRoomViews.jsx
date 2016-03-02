/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.standaloneRoomViews = (function(mozL10n) {
  "use strict";

  var FAILURE_DETAILS = loop.shared.utils.FAILURE_DETAILS;
  var ROOM_INFO_FAILURES = loop.shared.utils.ROOM_INFO_FAILURES;
  var ROOM_STATES = loop.store.ROOM_STATES;
  var sharedActions = loop.shared.actions;
  var sharedMixins = loop.shared.mixins;
  var sharedViews = loop.shared.views;

  var ToSView = React.createClass({
    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired
    },

    _getContent: function() {
      // We use this technique of static markup as it means we get
      // just one overall string for L10n to define the structure of
      // the whole item.
      return mozL10n.get("legal_text_and_links", {
        "clientShortname": mozL10n.get("clientShortname2"),
        "terms_of_use_url": React.renderToStaticMarkup(
          <a href={loop.config.legalWebsiteUrl} rel="noreferrer" target="_blank">
            {mozL10n.get("terms_of_use_link_text")}
          </a>
        ),
        "privacy_notice_url": React.renderToStaticMarkup(
          <a href={loop.config.privacyWebsiteUrl} rel="noreferrer" target="_blank">
            {mozL10n.get("privacy_notice_link_text")}
          </a>
        )
      });
    },

    recordClick: function(event) {
      // Check for valid href, as this is clicking on the paragraph -
      // so the user may be clicking on the text rather than the link.
      if (event.target && event.target.href) {
        this.props.dispatcher.dispatch(new sharedActions.RecordClick({
          linkInfo: event.target.href
        }));
      }
    },

    render: function() {
      return (
        <p
          className="terms-service"
          dangerouslySetInnerHTML={{ __html: this._getContent() }}
          onClick={this.recordClick}></p>
      );
    }
  });

  var StandaloneHandleUserAgentView = React.createClass({
    mixins: [
      loop.store.StoreMixin("activeRoomStore")
    ],

    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired
    },

    getInitialState: function() {
      return this.getStoreState();
    },

    handleJoinButton: function() {
      this.props.dispatcher.dispatch(new sharedActions.JoinRoom());
    },

    _renderJoinButton: function() {
      var buttonMessage = this.state.roomState === ROOM_STATES.JOINED ?
        mozL10n.get("rooms_room_joined_own_conversation_label") :
        mozL10n.get("rooms_room_join_label");

      var buttonClasses = classNames({
        btn: true,
        "btn-info": true,
        disabled: this.state.roomState === ROOM_STATES.JOINED
      });

      return (
        <button
          className={buttonClasses}
          onClick={this.handleJoinButton}>
          {buttonMessage}
        </button>
      );
    },

    _renderFailureText: function() {
      return (
        <p className="failure">{mozL10n.get("rooms_already_joined")}</p>
      );
    },

    render: function() {
      var roomName = this.state.roomName ||
                     this.state.roomContextUrls[0].description ||
                     this.state.roomContextUrls[0].location;
      // The extra scroller div here is for providing a scroll view for shorter
      // screens, as the common.css specifies overflow:hidden for the body which
      // we need in some places.
      return (
        <div className="handle-user-agent-view-scroller">
          <div className="handle-user-agent-view">
            <div className="info-panel">
              <p className="loop-logo-text" title={mozL10n.get("clientShortname2")}></p>
              <p className="roomName">{roomName}</p>
              <p className="loop-logo" />
              {
                this.state.failureReason ?
                  this._renderFailureText() :
                  this._renderJoinButton()
              }
            </div>
            <ToSView dispatcher={this.props.dispatcher} />
            <img className="mozilla-logo" src="/img/mozilla-logo.svg#logo" />
          </div>
        </div>
      );
    }
  });

  /**
   * Handles display of failures, determining the correct messages and
   * displaying the retry button at appropriate times.
   */
  var StandaloneRoomFailureView = React.createClass({
    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      // One of FAILURE_DETAILS.
      failureReason: React.PropTypes.string
    },

    /**
     * Handles when the retry button is pressed.
     */
    handleRetryButton: function() {
      this.props.dispatcher.dispatch(new sharedActions.RetryAfterRoomFailure());
    },

    /**
     * @return String An appropriate string according to the failureReason.
     */
    getFailureString: function() {
      switch (this.props.failureReason) {
        case FAILURE_DETAILS.MEDIA_DENIED:
        // XXX Bug 1166824 should provide a better string for this.
        case FAILURE_DETAILS.NO_MEDIA:
          return mozL10n.get("rooms_media_denied_message");
        case FAILURE_DETAILS.EXPIRED_OR_INVALID:
          return mozL10n.get("rooms_unavailable_notification_message");
        case FAILURE_DETAILS.TOS_FAILURE:
          return mozL10n.get("tos_failure_message",
            { clientShortname: mozL10n.get("clientShortname2") });
        case FAILURE_DETAILS.ICE_FAILED:
          return mozL10n.get("rooms_ice_failure_message");
        case FAILURE_DETAILS.COULD_NOT_CONNECT:
          return mozL10n.get("rooms_server_unavailable_message");
        default:
          return mozL10n.get("status_error");
      }
    },

    /**
     * This renders a retry button if one is necessary.
     */
    renderRetryButton: function() {
      if (this.props.failureReason === FAILURE_DETAILS.EXPIRED_OR_INVALID ||
          this.props.failureReason === FAILURE_DETAILS.TOS_FAILURE) {
        return null;
      }

      return (
        <button className="btn btn-join btn-info"
                onClick={this.handleRetryButton}>
          {mozL10n.get("retry_call_button")}
        </button>
      );
    },

    render: function() {
      return (
        <div className="room-inner-info-area">
          <p className="failed-room-message">
            {this.getFailureString()}
          </p>
          {this.renderRetryButton()}
        </div>
      );
    }
  });

  var StandaloneRoomInfoArea = React.createClass({
    statics: {
      RENDER_WAITING_DELAY: 2000
    },

    propTypes: {
      activeRoomStore: React.PropTypes.instanceOf(loop.store.ActiveRoomStore).isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      failureReason: React.PropTypes.string,
      isFirefox: React.PropTypes.bool.isRequired,
      joinRoom: React.PropTypes.func.isRequired,
      roomState: React.PropTypes.string.isRequired,
      roomUsed: React.PropTypes.bool.isRequired,
      screenSharingPaused: React.PropTypes.bool
    },

    getInitialState: function() {
      return { waitToRenderWaiting: true };
    },

    componentDidMount: function() {
      // Watch for messages from the waiting-tile iframe
      window.addEventListener("message", this.recordTileClick);
    },

    /**
     * Change state to allow for the waiting message to be shown and send an
     * event to record that fact.
     */
    _allowRenderWaiting: function() {
      delete this._waitTimer;

      // Only update state if we're still showing a waiting message.
      switch (this.props.roomState) {
        case ROOM_STATES.JOINING:
        case ROOM_STATES.JOINED:
        case ROOM_STATES.SESSION_CONNECTED:
          this.setState({ waitToRenderWaiting: false });
          this.props.dispatcher.dispatch(new sharedActions.TileShown());
          break;
      }
    },

    componentDidUpdate: function() {
      // Start a timer once from the earliest waiting state or from the state
      // after someone else leaves if we need to wait before showing a message.
      if ((this.props.roomState === ROOM_STATES.JOINING ||
           this.props.roomState === ROOM_STATES.SESSION_CONNECTED) &&
          this.state.waitToRenderWaiting &&
          this._waitTimer === undefined) {
        this._waitTimer = setTimeout(this._allowRenderWaiting,
          this.constructor.RENDER_WAITING_DELAY);
      }
    },

    componentWillReceiveProps: function(nextProps) {
      switch (nextProps.roomState) {
        // Reset waiting for the next time the user joins.
        case ROOM_STATES.ENDED:
        case ROOM_STATES.READY:
          if (!this.state.waitToRenderWaiting) {
            this.setState({ waitToRenderWaiting: true });
          }
          if (this._waitTimer !== undefined) {
            clearTimeout(this._waitTimer);
            delete this._waitTimer;
          }
          break;
      }
    },

    componentWillUnmount: function() {
      window.removeEventListener("message", this.recordTileClick);
    },

    recordTileClick: function(event) {
      if (event.data === "tile-click") {
        this.props.dispatcher.dispatch(new sharedActions.RecordClick({
          linkInfo: "Tiles iframe click"
        }));
      }
    },

    recordTilesSupport: function() {
      this.props.dispatcher.dispatch(new sharedActions.RecordClick({
        linkInfo: "Tiles support link click"
      }));
    },

    _renderCallToActionLink: function() {
      if (this.props.isFirefox) {
        return (
          <a className="btn btn-info" href={loop.config.learnMoreUrl}>
            {mozL10n.get("rooms_room_full_call_to_action_label", {
              clientShortname: mozL10n.get("clientShortname2")
            })}
          </a>
        );
      }
      return (
        <a className="btn btn-info" href={loop.config.downloadFirefoxUrl}>
          {mozL10n.get("rooms_room_full_call_to_action_nonFx_label", {
            brandShortname: mozL10n.get("brandShortname")
          })}
        </a>
      );
    },


    _renderPromoteFirefoxView: function() {
      return (
        <div className="promote-firefox">
          <h2>{mozL10n.get("rooms_promote_firefox_label")}</h2>
          <button className="btn btn-info"
                  onClick={this.props.joinRoom}>
            {mozL10n.get("rooms_promote_firefox_button", {
              brandShortname: mozL10n.get("brandShortname")
            })}
          </button>
        </div>
      );
    },

    _renderScreenSharingPausedView: function() {
      return (
        <div className="room-inner-info-area">
          <div className="remote-stream-paused">
            <h1>
              {mozL10n.get("rooms_screen_share_paused")}
            </h1>
          </div>
        </div>
      );
    },

    render: function() {
      switch (this.props.roomState) {
        case ROOM_STATES.ENDED: {
          return (
            <div className="room-notification-area">
              <div className="room-notification-header">
                <h2>You have disconnected.</h2>
              </div>
              <div className="room-notification-content">
                <button className="btn btn-join btn-info"
                        onClick={this.props.joinRoom}>
                  Rejoin
                </button>
                {!this.props.isFirefox ? this._renderPromoteFirefoxView() : null}
              </div>
            </div>
          );
        }
        case ROOM_STATES.READY: {
          return (
            <div className="room-notification-area">
              <div className="room-notification-header brand-header"></div>
              <div className="room-notification-content">
                <h2>{mozL10n.get("rooms_welcome_label")}</h2>
                <p>{mozL10n.get("rooms_welcome_description")}</p>
                <p>{mozL10n.get("rooms_welcome_get_started")}</p>
                <button className="btn btn-join btn-info"
                        onClick={this.props.joinRoom}>
                  {mozL10n.get("rooms_room_join_label")}
                </button>
              </div>
            </div>
          );
        }
        case ROOM_STATES.MEDIA_WAIT: {
          var msg = mozL10n.get("call_progress_getting_media_description",
                                { clientShortname: mozL10n.get("clientShortname2") });
          var utils = loop.shared.utils;
          var isChrome = utils.isChrome(navigator.userAgent);
          var isFirefox = utils.isFirefox(navigator.userAgent);
          var isOpera = utils.isOpera(navigator.userAgent);
          var promptMediaMessageClasses = classNames({
            "prompt-media-message": true,
            "chrome": isChrome,
            "firefox": isFirefox,
            "opera": isOpera,
            "other": !isChrome && !isFirefox && !isOpera
          });
          return (
            <p className={promptMediaMessageClasses}>
              {msg}
            </p>
          );
        }
        case ROOM_STATES.JOINING:
        case ROOM_STATES.JOINED:
        case ROOM_STATES.SESSION_CONNECTED: {
          // Don't show the waiting display until after a brief wait in case
          // there's another participant that will momentarily appear.
          if (this.state.waitToRenderWaiting) {
            return null;
          }

          var storeState = this.props.activeRoomStore.getStoreState("roomContextUrls");
          var context = storeState[0] || [];

          // Bug 1196143 - formatURL sanitizes(decodes) the URL from IDN homographic attacks.
          // Try catch to not produce output if invalid url
          try {
            var sanitizeURL = loop.shared.utils.formatURL(context.location, true).hostname;
          } catch (ex) {
            sanitizeURL = null;
          }

          var thumbnail = context.thumbnail;

          if (!thumbnail) {
            thumbnail = "shared/img/icons-16x16.svg#globe";
          }

          var title = mozL10n.get(this.props.activeRoomStore.getStoreState("remotePeerDisconnected") ?
            "room_owner_left_label" : "rooms_only_occupant_label2");

          return (
            <div className="room-notification-area">
              <div className="room-notification-header">
                <h2>{title}</h2>
              </div>
              <div className="room-notification-content">
                <p>
                  {mozL10n.get("rooms_wait_message")}
                </p>

                <div className="room-notification-context">
                  <a className="context-wrapper"
                     href={context.location ? context.location : null}
                     rel="noreferrer"
                     target="_blank">
                    <img className="context-preview" src={thumbnail} />
                    <span className="context-info">
                      {context.description}
                      <span className="context-url">
                        {sanitizeURL}
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          );
        }
        case ROOM_STATES.FULL: {
          return (
            <div className="room-inner-info-area">
              <p className="full-room-message">
                {mozL10n.get("rooms_room_full_label")}
              </p>
              <p>{this._renderCallToActionLink()}</p>
            </div>
          );
        }
        case ROOM_STATES.FAILED: {
          return (
            <StandaloneRoomFailureView
              dispatcher={this.props.dispatcher}
              failureReason={this.props.failureReason} />
          );
        }
        case ROOM_STATES.HAS_PARTICIPANTS:
          if (this.props.screenSharingPaused) {
            return this._renderScreenSharingPausedView();
          }
          return null;
        case ROOM_STATES.INIT:
        case ROOM_STATES.GATHER:
        default: {
          return null;
        }
      }
    }
  });

  var StandaloneInfoBar = React.createClass({
    propTypes: {
      audio: React.PropTypes.object.isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      leaveRoom: React.PropTypes.func.isRequired,
      room: React.PropTypes.object.isRequired,
      video: React.PropTypes.object.isRequired
    },

    getDefaultProps: function() {
      return {
        video: { enabled: true, visible: true },
        audio: { enabled: true, visible: true }
      };
    },

    handleClick: function(event) {
      event.stopPropagation();
      event.preventDefault();
      if (event.currentTarget.href) {
        loop.request("OpenURL", event.currentTarget.href);
      }
    },

    renderButtons: function() {
      var showButtons = this.props.video.visible || this.props.audio.visible;
      if (!showButtons) {
        return (
          <div className="media-control-buttons">
            <GeneralSupportURL dispatcher={this.props.dispatcher} />
          </div>
        );
      }

      return (
        <div className="media-control-buttons">
          <sharedViews.VideoMuteButton
            dispatcher={this.props.dispatcher}
            muted={!this.props.video.enabled}/>
          <sharedViews.AudioMuteButton
            dispatcher={this.props.dispatcher}
            muted={!this.props.audio.enabled}/>
          <GeneralSupportURL dispatcher={this.props.dispatcher} />
          <sharedViews.HangUpControlButton
            action={this.props.leaveRoom}
            title={mozL10n.get("rooms_leave_button_label")}/>
        </div>
      );
    },

    render: function() {
      return (
        <div className="standalone-info-bar">
          <div className="hello-logo"></div>
          <div className="standalone-info-bar-spacer">
            <StandaloneInfoView
              dispatcher={this.props.dispatcher}
              room={this.props.room}/>
          </div>
          {this.renderButtons()}
        </div>
      );
    }
  });

  var StandaloneInfoView = React.createClass({
    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      room: React.PropTypes.object.isRequired
    },

    renderIcon: function() {
      var urlData = (this.props.room.roomContextUrls || [])[0] || {};
      if (urlData.location) {
        return (
          <img className="context-favicon" src={urlData.thumbnail || "shared/img/icons-16x16.svg#globe"} />
        );
      }

      return (
        <img className="context-favicon" src="shared/img/icons-16x16.svg#globe" />
      );
    },

    renderContext: function() {
      var urlData = (this.props.room.roomContextUrls || [])[0] || {};
      var roomTitle = this.props.room.roomName ||
        urlData.description || urlData.location ||
        mozL10n.get("room_name_untitled_page");

      return (
        <div className="context-info">
          <a href={urlData.location}
            rel="noreferrer"
            target="_blank"
            title={urlData.description}>
            {this.renderIcon()}
            <h2>{roomTitle}</h2>
          </a>
        </div>
      );
    },

    render: function() {
      switch (this.props.room.roomState) {
        case ROOM_STATES.ENDED:
        case ROOM_STATES.READY:
        case ROOM_STATES.FULL:
        case ROOM_STATES.FAILED:
        case ROOM_STATES.INIT:
        case ROOM_STATES.GATHER:
          return (
            <div className="context-info">
              <ToSView dispatcher={this.props.dispatcher} />
            </div>
          );
        case ROOM_STATES.MEDIA_WAIT:
        case ROOM_STATES.JOINING:
        case ROOM_STATES.JOINED:
        case ROOM_STATES.SESSION_CONNECTED:
          return (
            this.renderContext()
          );
        default:
          return null;
      }
    }
  });

  var StandaloneRoomView = React.createClass({
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
      cursorStore: React.PropTypes.instanceOf(loop.store.RemoteCursorStore).isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      introSeen: React.PropTypes.bool,
      isFirefox: React.PropTypes.bool.isRequired,
      // The poster URLs are for UI-showcase testing and development
      localPosterUrl: React.PropTypes.string,
      remotePosterUrl: React.PropTypes.string,
      roomState: React.PropTypes.string,
      screenSharePosterUrl: React.PropTypes.string
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
      } else {
        if (localStorage.getItem("introSeen") !== null) {
          introSeen = true;
        }
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

    componentDidMount: function() {
      // Adding a class to the document body element from here to ease styling it.
      document.body.classList.add("is-standalone-room");
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

    joinRoom: function() {
      this.props.dispatcher.dispatch(new sharedActions.JoinRoom());
    },

    leaveRoom: function() {
      this.props.dispatcher.dispatch(new sharedActions.LeaveRoom());
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

    /**
     * Should we render a visual cue to the user (e.g. a spinner) that a remote
     * screen-share is on its way from the other user?
     *
     * @returns {boolean}
     * @private
     */
    _isScreenShareLoading: function() {
      return this.state.receivingScreenShare &&
             !this.state.screenShareMediaElement &&
             !this.props.screenSharePosterUrl;
    },

    render: function() {
      var displayScreenShare = !!(this.state.receivingScreenShare ||
        this.props.screenSharePosterUrl);

      return (
        <div className="room-conversation-wrapper standalone-room-wrapper">
          <StandaloneInfoBar
            audio={{ enabled: !this.state.audioMuted,
                     visible: this._roomIsActive() }}
            dispatcher={this.props.dispatcher}
            leaveRoom={this.leaveRoom}
            room={this.props.activeRoomStore.getStoreState()}
            video={{ enabled: !this.state.videoMuted,
                     visible: this._roomIsActive() }} />
          <sharedViews.MediaLayoutView
            cursorStore={this.props.cursorStore}
            dispatcher={this.props.dispatcher}
            displayScreenShare={displayScreenShare}
            isLocalLoading={this._isLocalLoading()}
            isRemoteLoading={this._isRemoteLoading()}
            isScreenShareLoading={this._isScreenShareLoading()}
            localPosterUrl={this.props.localPosterUrl}
            localSrcMediaElement={this.state.localSrcMediaElement}
            localVideoMuted={this.state.videoMuted}
            matchMedia={this.state.matchMedia || window.matchMedia.bind(window)}
            remotePosterUrl={this.props.remotePosterUrl}
            remoteSrcMediaElement={this.state.remoteSrcMediaElement}
            renderRemoteVideo={this.shouldRenderRemoteVideo()}
            screenShareMediaElement={this.state.screenShareMediaElement}
            screenSharePosterUrl={this.props.screenSharePosterUrl}
            screenSharingPaused={this.state.streamPaused}
            showInitialContext={true}>
            <StandaloneRoomInfoArea activeRoomStore={this.props.activeRoomStore}
              dispatcher={this.props.dispatcher}
              failureReason={this.state.failureReason}
              isFirefox={this.props.isFirefox}
              joinRoom={this.joinRoom}
              roomState={this.state.roomState}
              roomUsed={this.state.used}
              screenSharingPaused={this.state.streamPaused} />
          </sharedViews.MediaLayoutView>
          {(this.state.introSeen) ? null : <IntroOverlayView joinRoom={this.joinRoom} />}
        </div>
      );
    }
  });

  var GeneralSupportURL = React.createClass({
    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired
    },

    generalSupportUrlClick: function() {
      this.props.dispatcher.dispatch(new sharedActions.RecordClick({
        linkInfo: "Support link click"
      }));
    },

    render: function() {
      return (
        <a className="general-support-url"
          href={loop.config.generalSupportUrl}
          onClick={this.generalSupportUrlClick}
          rel="noreferrer"
          target="_blank"
          title={mozL10n.get("rooms_general_support_button_label")}>
          <div className="icon icon-help"></div>
        </a>
      );
    }
  });

  var Slide = React.createClass({
    propTypes: {
      imageClass: React.PropTypes.string.isRequired,
      indexClass: React.PropTypes.string.isRequired,
      joinRoom: React.PropTypes.func.isRequired,
      text: React.PropTypes.string.isRequired,
      title: React.PropTypes.string.isRequired
    },

    handleGotItClick: function(event) {
      event.stopPropagation();
      event.preventDefault();

      // XXX we shouldn't be unnecessarily messing with the DOM behind
      // React's back, as this can confuse React.  Furthermore, on close, the
      // parent's state should be updated so that it doesn't render this
      // component at all, as per the usual React idiom.  The way to do this
      // is to have the parent pass in a close callback, which updates the
      // parents state (either directly or via action dispatch to a store),
      // causing the parent not to render this overlay.  This should also
      // allow us to fix the duplication of code in handleCloseClick.
      // (bug 1252306).
      var overlayElem = document.getElementsByClassName("intro-overlay")[0];
      overlayElem.classList.add("hide");
      // telemetry string data as to which button was clicked
      localStorage.setItem("introSeen", "true");
      this.props.joinRoom();
    },

    render: function() {
      return (
        <div className="slide">
          <div className={this.props.indexClass}>
            <div className="slide-layout">
              <div className={this.props.imageClass} />
              <h2>{this.props.title}</h2>
              <div className="slide-text">{this.props.text}</div>
              <button className="button-got-it" onClick={this.handleGotItClick}>
                {mozL10n.get("intro_slide_button")}
              </button>
            </div>
          </div>
        </div>
      );
    }
  });

  var IntroOverlayView = React.createClass({
    propTypes: {
      joinRoom: React.PropTypes.func.isRequired
    },

    handleCloseClick: function(event) {
      event.stopPropagation();
      event.preventDefault();

      // XXX we shouldn't be unnecessarily messing with the DOM behind
      // React's back, as this can confuse React.  Furthermore, on close, the
      // parent's state should be updated so that it doesn't render this
      // component at all, as per the usual React idiom.  The way to do this
      // is to have the parent pass in a close callback, which updates the
      // parents state (either directly or via action dispatch to a store),
      // causing the parent not to render this overlay.  This should also
      // allow us to fix the duplication of code in handleGotItClick.
      // (bug 1252306).
      var overlayElem = document.getElementsByClassName("intro-overlay")[0];
      overlayElem.classList.add("hide");
      // telemetry string data as to which button was clicked
      localStorage.setItem("introSeen", "true");
      this.props.joinRoom();
    },

    render: function() {
      var slideNode = {
        id: "slide1",
        imageClass: "slide1-image",
        title: mozL10n.get("intro_slide_title"),
        text: mozL10n.get("intro_slide_copy", {
          clientSuperShortname: mozL10n.get("clientSuperShortname")
        })
      };
      return (
        <div className="intro-overlay">
          <div className="slideshow">
            <div className="slideshow-header">
              <button className="button-close" onClick={this.handleCloseClick} />
            </div>
            <Slide imageClass={slideNode.imageClass}
                   indexClass={slideNode.id}
                   joinRoom={this.props.joinRoom}
                   text={slideNode.text}
                   title={slideNode.title} />
            </div>
        </div>
      );
    }
  });


  var StandaloneRoomControllerView = React.createClass({
    mixins: [
      loop.store.StoreMixin("activeRoomStore")
    ],

    propTypes: {
      cursorStore: React.PropTypes.instanceOf(loop.store.RemoteCursorStore).isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      isFirefox: React.PropTypes.bool.isRequired
    },

    getInitialState: function() {
      return this.getStoreState();
    },

    render: function() {
      // If we don't know yet, don't display anything.
      if (this.state.userAgentHandlesRoom === undefined) {
        return null;
      }

      if (this.state.userAgentHandlesRoom) {
        return (
          <StandaloneHandleUserAgentView
            dispatcher={this.props.dispatcher} />
        );
      }

      return (
        <StandaloneRoomView
          activeRoomStore={this.getStore()}
          cursorStore={this.props.cursorStore}
          dispatcher={this.props.dispatcher}
          isFirefox={this.props.isFirefox} />
      );
    }
  });

  return {
    StandaloneHandleUserAgentView: StandaloneHandleUserAgentView,
    StandaloneInfoBar: StandaloneInfoBar,
    StandaloneInfoView: StandaloneInfoView,
    StandaloneRoomControllerView: StandaloneRoomControllerView,
    StandaloneRoomFailureView: StandaloneRoomFailureView,
    StandaloneRoomInfoArea: StandaloneRoomInfoArea,
    StandaloneRoomView: StandaloneRoomView,
    ToSView: ToSView
  };
})(navigator.mozL10n);
