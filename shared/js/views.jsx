/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.shared = loop.shared || {};
loop.shared.views = (function(_, mozL10n) {
  "use strict";

  var sharedActions = loop.shared.actions;
  var sharedMixins = loop.shared.mixins;

  /**
   * Hang-up control button.
   *
   * Required props:
   * - {Function} action  Function to be executed on click.
   * - {String}   title   Tooltip functionality.
   */
  var HangUpControlButton = React.createClass({
    mixins: [
      React.addons.PureRenderMixin
    ],

    propTypes: {
      action: React.PropTypes.func.isRequired,
      title: React.PropTypes.string
    },

    handleClick: function() {
      this.props.action();
    },

    render: function() {
      return (
          <button className="btn btn-hangup"
                  onClick={this.handleClick}
                  title={this.props.title} />
      );
    }
  });

  /**
   * Media control button.
   *
   * Required props:
   * - {String}   scope   Media scope, can be "local" or "remote".
   * - {String}   type    Media type, can be "audio" or "video".
   * - {Function} action  Function to be executed on click.
   * - {Bool} muted Stream activation status (default: false).
   */
  var MediaControlButton = React.createClass({
    propTypes: {
      action: React.PropTypes.func.isRequired,
      disabled: React.PropTypes.bool,
      muted: React.PropTypes.bool.isRequired,
      scope: React.PropTypes.string.isRequired,
      title: React.PropTypes.string,
      type: React.PropTypes.string.isRequired,
      visible: React.PropTypes.bool.isRequired
    },

    getDefaultProps: function() {
      return {
        disabled: false,
        muted: false,
        visible: true
      };
    },

    handleClick: function() {
      this.props.action();
    },

    _getClasses: function() {
      var cx = classNames;
      // classes
      var classesObj = {
        "btn": true,
        "media-control": true,
        "transparent-button": true,
        "local-media": this.props.scope === "local",
        "muted": this.props.muted || this.props.disabled,
        "hide": !this.props.visible,
        "disabled": this.props.disabled
      };
      classesObj["btn-mute-" + this.props.type] = true;
      return cx(classesObj);
    },

    _getTitle: function() {
      if (this.props.title) {
        return this.props.title;
      }

      var prefix = this.props.muted || this.props.disabled ? "unmute" : "mute";
      var suffix = (this.props.type === "video") ? "button_title2" : "button_title";
      var msgId = [prefix, this.props.scope, this.props.type, suffix].join("_");
      return mozL10n.get(msgId);
    },

    render: function() {
      return (
        <button className={this._getClasses()}
                onClick={this.handleClick}
                title={this._getTitle()}></button>
      );
    }
  });

  /**
   * Conversation controls.
   */
  var ConversationToolbar = React.createClass({
    getDefaultProps: function() {
      return {
        video: { enabled: true, visible: true },
        audio: { enabled: true, visible: true },
        showHangup: true
      };
    },

    getInitialState: function() {
      return {
        idle: false
      };
    },

    propTypes: {
      audio: React.PropTypes.object.isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      hangup: React.PropTypes.func.isRequired,
      showHangup: React.PropTypes.bool,
      video: React.PropTypes.object.isRequired
    },

    handleClickHangup: function() {
      this.props.hangup();
    },

    componentDidMount: function() {
      this.userActivity = false;
      this.startIdleCountDown();
      document.body.addEventListener("mousemove", this._onBodyMouseMove);
    },

    componentWillUnmount: function() {
      clearTimeout(this.inactivityTimeout);
      clearInterval(this.inactivityPollInterval);
      document.body.removeEventListener("mousemove", this._onBodyMouseMove);
    },

    /**
     * If the conversation toolbar is idle, update its state and initialize the countdown
     * to return of the idle state. If the toolbar is active, only it's updated the userActivity flag.
     */
    _onBodyMouseMove: function() {
      if (this.state.idle) {
        this.setState({ idle: false });
        this.startIdleCountDown();
      } else {
        this.userActivity = true;
      }
    },

    /**
     * Instead of resetting the timeout for every mousemove (this event is called to many times,
     * when the mouse is moving, we check the flat userActivity every 4 seconds. If the flag is activated,
     * the user is still active, and we can restart the countdown for the idle state
     */
    checkUserActivity: function() {
      this.inactivityPollInterval = setInterval(function() {
        if (this.userActivity) {
          this.userActivity = false;
          this.restartIdleCountDown();
        }
      }.bind(this), 4000);
    },

    /**
     * Stop the execution of the current inactivity countdown and it starts a new one.
     */
    restartIdleCountDown: function() {
      clearTimeout(this.inactivityTimeout);
      this.startIdleCountDown();
    },

    /**
     * Launchs the process to check the user activity and the inactivity countdown to change
     * the toolbar to idle.
     * When the toolbar changes to idle, we remove the procces to check the user activity,
     * because the toolbar is going to be updated directly when the user moves the mouse.
     */
    startIdleCountDown: function() {
      this.checkUserActivity();
      this.inactivityTimeout = setTimeout(function() {
        this.setState({ idle: true });
        clearInterval(this.inactivityPollInterval);
      }.bind(this), 6000);
    },

    render: function() {
      var cx = classNames;
      var conversationToolbarCssClasses = cx({
        "conversation-toolbar": true,
        "idle": this.state.idle
      });
      var showButtons = this.props.video.visible || this.props.audio.visible;
      var mediaButtonGroupCssClasses = cx({
        "conversation-toolbar-media-btn-group-box": true,
        "hide": !showButtons
      });
      return (
        <ul className={conversationToolbarCssClasses}>
        {
          this.props.showHangup && showButtons ?
          <li className="conversation-toolbar-btn-box btn-hangup-entry">
            <HangUpControlButton action={this.handleClickHangup}
                                 title={mozL10n.get("rooms_leave_button_label")} />
          </li> : null
        }

          <li className="conversation-toolbar-btn-box">
            <div className={mediaButtonGroupCssClasses}>
                <VideoMuteButton dispatcher={this.props.dispatcher}
                                 muted={!this.props.video.enabled} />
                <AudioMuteButton dispatcher={this.props.dispatcher}
                                 muted={!this.props.audio.enabled} />
            </div>
          </li>
        </ul>
      );
    }
  });

  var AudioMuteButton = React.createClass({
    propTypes: {
      disabled: React.PropTypes.bool,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher),
      muted: React.PropTypes.bool.isRequired
    },

    getDefaultProps: function() {
      return {
        disabled: false
      };
    },

    toggleAudio: function() {
      if (this.props.disabled) {
        return;
      }

      this.props.dispatcher.dispatch(
        new sharedActions.SetMute({ type: "audio", enabled: this.props.muted })
      );
    },

    render: function() {
      return (
        <MediaControlButton action={this.toggleAudio}
                            disabled={this.props.disabled}
                            muted={this.props.muted}
                            scope="local"
                            type="audio" />
      );
    }
  });

  var VideoMuteButton = React.createClass({
    propTypes: {
      disabled: React.PropTypes.bool,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher),
      muted: React.PropTypes.bool.isRequired
    },

    getDefaultProps: function() {
      return {
        disabled: false
      };
    },

    toggleVideo: function() {
      if (this.props.disabled) {
        return;
      }

      this.props.dispatcher.dispatch(
        new sharedActions.SetMute({ type: "video", enabled: this.props.muted })
      );
    },

    render: function() {
      return (
        <MediaControlButton action={this.toggleVideo}
                            disabled={this.props.disabled}
                            muted={this.props.muted || this.props.disabled}
                            scope="local"
                            type="video" />
      );
    }
  });

  var ScreenShareButton = React.createClass({
    propTypes: {
      disabled: React.PropTypes.bool,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher),
      muted: React.PropTypes.bool.isRequired
    },

    getDefaultProps: function() {
      return {
        disabled: false
      };
    },

    toggleScreenShare: function() {
      if (this.props.disabled) {
        return;
      }

      var action = this.props.muted ? "StartBrowserShare" : "EndScreenShare";
      this.props.dispatcher.dispatch(new sharedActions[action]());
    },

    render: function() {
      return (
        <MediaControlButton action={this.toggleScreenShare}
                            disabled={this.props.disabled}
                            muted={this.props.muted || this.props.disabled}
                            scope="local"
                            type="screen" />
      );
    }
  });

  var Button = React.createClass({
    propTypes: {
      additionalClass: React.PropTypes.string,
      caption: React.PropTypes.string.isRequired,
      children: React.PropTypes.element,
      disabled: React.PropTypes.bool,
      htmlId: React.PropTypes.string,
      onClick: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
      return {
        disabled: false,
        additionalClass: "",
        htmlId: ""
      };
    },

    render: function() {
      var cx = classNames;
      var classObject = { button: true, disabled: this.props.disabled };
      if (this.props.additionalClass) {
        classObject[this.props.additionalClass] = true;
      }
      return (
        <button className={cx(classObject)}
                disabled={this.props.disabled}
                id={this.props.htmlId}
                onClick={this.props.onClick}>
          <span className="button-caption">{this.props.caption}</span>
          {this.props.children}
        </button>
      );
    }
  });

  var ButtonGroup = React.createClass({
    propTypes: {
      additionalClass: React.PropTypes.string,
      children: React.PropTypes.oneOfType([
        React.PropTypes.element,
        React.PropTypes.arrayOf(React.PropTypes.element)
      ])
    },

    getDefaultProps: function() {
      return {
        additionalClass: ""
      };
    },

    render: function() {
      var cx = classNames;
      var classObject = { "button-group": true };
      if (this.props.additionalClass) {
        classObject[this.props.additionalClass] = true;
      }
      return (
        <div className={cx(classObject)}>
          {this.props.children}
        </div>
      );
    }
  });

  var Checkbox = React.createClass({
    propTypes: {
      additionalClass: React.PropTypes.string,
      checked: React.PropTypes.bool,
      disabled: React.PropTypes.bool,
      label: React.PropTypes.string,
      onChange: React.PropTypes.func.isRequired,
      // If true, this will cause the label to be cut off at the end of the
      // first line with an ellipsis, and a tooltip supplied.
      useEllipsis: React.PropTypes.bool,
      // If `value` is not supplied, the consumer should rely on the boolean
      // `checked` state changes.
      value: React.PropTypes.string
    },

    getDefaultProps: function() {
      return {
        additionalClass: "",
        checked: false,
        disabled: false,
        label: null,
        useEllipsis: false,
        value: ""
      };
    },

    componentWillReceiveProps: function(nextProps) {
      // Only change the state if the prop has changed, and if it is also
      // different from the state.
      if (this.props.checked !== nextProps.checked &&
          this.state.checked !== nextProps.checked) {
        this.setState({ checked: nextProps.checked });
      }
    },

    getInitialState: function() {
      return {
        checked: this.props.checked,
        value: this.props.checked ? this.props.value : ""
      };
    },

    _handleClick: function(event) {
      event.preventDefault();

      var newState = {
        checked: !this.state.checked,
        value: this.state.checked ? "" : this.props.value
      };
      this.setState(newState);
      this.props.onChange(newState);
    },

    render: function() {
      var cx = classNames;
      var wrapperClasses = {
        "checkbox-wrapper": true,
        disabled: this.props.disabled
      };
      var checkClasses = {
        checkbox: true,
        checked: this.state.checked,
        disabled: this.props.disabled
      };
      var labelClasses = {
        "checkbox-label": true,
        "ellipsis": this.props.useEllipsis
      };

      if (this.props.additionalClass) {
        wrapperClasses[this.props.additionalClass] = true;
      }
      return (
        <div className={cx(wrapperClasses)}
             disabled={this.props.disabled}
             onClick={this._handleClick}>
          <div className={cx(checkClasses)} />
          {
            this.props.label ?
              <div className={cx(labelClasses)}
                   title={this.props.useEllipsis ? this.props.label : ""}>
                {this.props.label}
              </div> : null
          }
        </div>
      );
    }
  });

  /**
   * Renders an avatar element for display when video is muted.
   */
  var AvatarView = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    render: function() {
        return <div className="avatar" />;
    }
  });

  /**
   * Renders a loading spinner for when video content is not yet available.
   */
  var LoadingView = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    render: function() {
        return (
          <div className="loading-background">
            <div className="loading-stream" />
          </div>
        );
    }
  });

  /**
   * Renders the a href link for context.
   *
   * @property {Boolean} allowClick         Set to true to allow the url to be clicked.
   * @property {String}  description        The description for the context url.
   * @property {Function}  handleClick      Function for handling click operation when
   *                                        context link is clicked
   * @property {String}  thumbnail          The thumbnail url (expected to be a data url) to
   *                                        display. If not specified, a fallback url will be
   *                                        shown.
   * @property {String}  url                The url to be displayed. If not present or invalid,
   *                                        the context link will not be clickable
   */
  var ContextUrlLink = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    propTypes: {
      allowClick: React.PropTypes.bool.isRequired,
      children: React.PropTypes.node,
      description: React.PropTypes.string,
      handleClick: React.PropTypes.func,
      url: React.PropTypes.string
    },

    render: function() {
      var sanitizedURL = loop.shared.utils.formatSanitizedContextURL(this.props.url);

      var opts = {};
      opts.classNames = classNames({
        "context-wrapper": true,
        "clicks-allowed": this.props.allowClick
      });
      if (this.props.allowClick && sanitizedURL) {
        opts.href = sanitizedURL.location;
      }
      if (this.props.handleClick) {
        opts.onClick = this.props.handleClick;
      }
      if (this.props.description) {
        opts.title = this.props.description;
      }

      return (
        <a className={opts.classNames}
           href={opts.href}
           onClick={opts.onClick}
           rel="noreferrer"
           target="_blank"
           title={opts.title}>
          {this.props.children}
        </a>
      );
    }
  });

 /**
   * Renders a url that's part of context on the display.
   *
   * @property {Boolean} allowClick         Set to true to allow the url to be clicked. If this
   *                                        is specified, then 'dispatcher' is also required.
   * @property {String}  description        The description for the context url.
   * @property {loop.Dispatcher} dispatcher
   * @property {String}  thumbnail          The thumbnail url (expected to be a data url) to
   *                                        display. If not specified, a fallback url will be
   *                                        shown.
   * @property {String}  url                The url to be displayed. If not present or invalid,
   *                                        then this view won't be displayed.
   * @property {String}  username           The name of the user that modified the ToC page
   *
   */
  var ContextUrlView = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    propTypes: {
      allowClick: React.PropTypes.bool.isRequired,
      description: React.PropTypes.string,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher),
      thumbnail: React.PropTypes.string,
      url: React.PropTypes.string
    },

    /**
     * Dispatches an action to record when the link is clicked.
     */
    handleLinkClick: function() {
      if (!this.props.allowClick) {
        return;
      }

      this.props.dispatcher.dispatch(new sharedActions.RecordClick({
        linkInfo: "Shared URL"
      }));
    },

    render: function() {
      var description = this.props.description || null;
      var thumbnail = this.props.thumbnail;
      var url = this.props.url || null;
      var sanitizedURL = loop.shared.utils.formatSanitizedContextURL(url) || {};
      var hostname = sanitizedURL.hostname || null;

      if (!thumbnail) {
        thumbnail = "shared/img/icons-16x16.svg#globe";
      }

      return (
        <div className="context-content">
          <ContextUrlLink allowClick={this.props.allowClick}
                          description={description}
                          handleClick={this.handleLinkClick}
                          url={url}>
            <img className="context-preview" src={thumbnail} />
            <span className="context-info">
              {description}
              <span className="context-url">
                {hostname}
              </span>
            </span>
          </ContextUrlLink>
        </div>
      );
    }
  });

  /**
   * Renders a tile with information about the page that has been added/deleted from the ToC.
   *
   * @property {Boolean} allowClick         Set to true to allow the url to be clicked. If this
   *                                        is specified, then 'dispatcher' is also required.
   * @property {String}  description        The description for the context url.
   * @property {loop.Dispatcher} dispatcher
   * @property {String}  thumbnail          The thumbnail url (expected to be a data url) to
   *                                        display. If not specified, a fallback url will be
   *                                        shown.
   * @property {String}  url                The url to be displayed. If not present or invalid,
   *                                        then this view won't be displayed.
   * @property {String}  username           The name of the user that modified the ToC page
   *
   */
  var ChatPageTileView = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    propTypes: {
      allowClick: React.PropTypes.bool.isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher),
      eventType: React.PropTypes.string.isRequired,
      thumbnail: React.PropTypes.string,
      timestamp: React.PropTypes.number,
      title: React.PropTypes.string,
      url: React.PropTypes.string,
      username: React.PropTypes.string
    },

    getDefaultProps: function() {
      return {
        thumbnail: "shared/img/icons-16x16.svg#globe",
        title: "WEB_TILE",
        url: "WEB_URL",
        username: "DEFAULT_USER"
      };
    },

    /**
     * Dispatches an action to record when the link is clicked.
     */
    handleLinkClick: function() {
      if (!this.props.allowClick) {
        return;
      }

      this.props.dispatcher.dispatch(new sharedActions.RecordClick({
        linkInfo: "Shared URL"
      }));
    },

    render: function() {
      var url = this.props.url;
      var username = this.props.username;
      var sanitizedURL = loop.shared.utils.formatSanitizedContextURL(url) || {};
      var date = this.props.timestamp ?
                  new Date(this.props.timestamp) :
                  null;
      return (
        <div className="tile-event">
          <p>{mozL10n.get(this.props.eventType, { username: username })}
            {
              date ?
              <span className="text-chat-entry-timestamp">
                {date.toLocaleTimeString(mozL10n.language.code, {
                                          hour: "numeric",
                                          minute: "numeric",
                                          hour12: false
                                        })}
              </span> : null
            }
          </p>
          <ContextUrlLink allowClick={this.props.allowClick}
                          description={this.props.title}
                          handleClick={this.handleLinkClick}
                          url={url}>
            <img className="context-preview" src={this.props.thumbnail} />
            <span className="context-info">
              {this.props.title}
              <span className="context-url">
                {sanitizedURL.hostname}
              </span>
            </span>
          </ContextUrlLink>
        </div>
      );
    }
  });


  /**
   * Renders a media element for display. This also handles displaying an avatar
   * instead of the video, and attaching a video stream to the video element.
   */
  var MediaView = React.createClass({
    // srcMediaElement should be ok for a shallow comparison, so we are safe
    // to use the pure render mixin here.
    mixins: [React.addons.PureRenderMixin],

    propTypes: {
      cursorStore: React.PropTypes.instanceOf(loop.store.RemoteCursorStore),
      dispatcher: React.PropTypes.object,
      displayAvatar: React.PropTypes.bool.isRequired,
      isLoading: React.PropTypes.bool.isRequired,
      mediaType: React.PropTypes.string.isRequired,
      posterUrl: React.PropTypes.string,
      screenSharingPaused: React.PropTypes.bool,
      shareCursor: React.PropTypes.bool,
      // Expecting "local" or "remote".
      srcMediaElement: React.PropTypes.object
    },

    getInitialState: function() {
      return {
        videoElementSize: null
      };
    },

    componentDidMount: function() {
      if (!this.props.displayAvatar) {
        this.attachVideo(this.props.srcMediaElement);
      }

      if (this.props.shareCursor) {
        this.handleVideoDimensions();
        window.addEventListener("resize", this.handleVideoDimensions);
      }
    },

    componentWillUnmount: function() {
      var videoElement = ReactDOM.findDOMNode(this).querySelector("video");
      if (!this.props.shareCursor || !videoElement) {
        return;
      }

      window.removeEventListener("resize", this.handleVideoDimensions);
      videoElement.removeEventListener("loadeddata", this.handleVideoDimensions);
      videoElement.removeEventListener("mousemove", this.handleMousemove);
      videoElement.removeEventListener("click", this.handleMouseClick);
    },

    componentDidUpdate: function() {
      if (!this.props.displayAvatar) {
        this.attachVideo(this.props.srcMediaElement);
      }
    },

    handleVideoDimensions: function() {
      var videoElement = ReactDOM.findDOMNode(this).querySelector("video");
      if (!videoElement) {
        return;
      }

      this.setState({
        videoElementSize: {
          clientWidth: videoElement.clientWidth,
          clientHeight: videoElement.clientHeight
        }
      });
    },

    MIN_CURSOR_DELTA: 3,
    MIN_CURSOR_INTERVAL: 100,
    lastCursorTime: 0,
    lastCursorX: -1,
    lastCursorY: -1,

    handleMouseMove: function(event) {
      // Only update every so often.
      var now = Date.now();
      if (now - this.lastCursorTime < this.MIN_CURSOR_INTERVAL) {
        return;
      }
      this.lastCursorTime = now;

      var storeState = this.props.cursorStore.getStoreState();

      // video is not at the top, so we need to calculate the offset
      var video = ReactDOM.findDOMNode(this).querySelector("video");
      var offset = video.getBoundingClientRect();

      var deltaX = event.clientX
                    - storeState.videoLetterboxing.left
                    - offset.left;
      var deltaY = event.clientY
                    - storeState.videoLetterboxing.top
                    - offset.top;

      // Skip the update if cursor is out of bounds
      if (deltaX < 0 || deltaX > storeState.streamVideoWidth ||
          deltaY < 0 || deltaY > storeState.streamVideoHeight ||
      // or the cursor didn't move the minimum.
          (Math.abs(deltaX - this.lastCursorX) < this.MIN_CURSOR_DELTA &&
           Math.abs(deltaY - this.lastCursorY) < this.MIN_CURSOR_DELTA)) {
        return;
      }

      this.lastCursorX = deltaX;
      this.lastCursorY = deltaY;

      this.props.dispatcher.dispatch(new sharedActions.SendCursorData({
        ratioX: deltaX / storeState.streamVideoWidth,
        ratioY: deltaY / storeState.streamVideoHeight,
        type: loop.shared.utils.CURSOR_MESSAGE_TYPES.POSITION
      }));
    },

    handleMouseClick: function() {
      this.props.dispatcher.dispatch(new sharedActions.SendCursorData({
        type: loop.shared.utils.CURSOR_MESSAGE_TYPES.CLICK
      }));
    },

    /**
     * Attaches a video stream from a donor video element to this component's
     * video element if the component is displaying one.
     *
     * @param {Object} srcMediaElement The src video object to clone the stream
     *                                from.
     *
     * XXX need to have a corresponding detachVideo or change this to syncVideo
     * to protect from leaks (bug 1171978)
     */
    attachVideo: function(srcMediaElement) {
      if (!srcMediaElement) {
        // Not got anything to display.
        return;
      }

      var videoElement = ReactDOM.findDOMNode(this).querySelector("video");
      if (!videoElement || videoElement.tagName.toLowerCase() !== "video") {
        // Must be displaying the avatar view, so don't try and attach video.
        return;
      }

      if (this.props.shareCursor && !this.props.screenSharingPaused) {
        videoElement.addEventListener("loadeddata", this.handleVideoDimensions);
        videoElement.addEventListener("mousemove", this.handleMouseMove);
        videoElement.addEventListener("click", this.handleMouseClick);
      }

      // Set the src of our video element
      var attrName = "";
      if ("srcObject" in videoElement) {
        // srcObject is according to the standard.
        attrName = "srcObject";
      } else if ("mozSrcObject" in videoElement) {
        // mozSrcObject is for Firefox
        attrName = "mozSrcObject";
      } else if ("src" in videoElement) {
        // src is for Chrome.
        attrName = "src";
      } else {
        console.error("Error attaching stream to element - no supported" +
                      "attribute found");
        return;
      }

      // If the object hasn't changed it, then don't reattach it.
      if (videoElement[attrName] !== srcMediaElement[attrName]) {
        videoElement[attrName] = srcMediaElement[attrName];
      }

      videoElement.play();
    },

    render: function() {
      if (this.props.isLoading) {
        return (
          <div className={this.props.mediaType}>
            <LoadingView />
          </div>
        );
      }

      if (this.props.displayAvatar) {
        return (
          <div className={this.props.mediaType}>
            <AvatarView />
          </div>
        );
      }

      if (!this.props.srcMediaElement && !this.props.posterUrl) {
        return <div className="no-video" />;
      }

      // For now, always mute media. For local media, we should be muted anyway,
      // as we don't want to hear ourselves speaking.
      //
      // For remote media, we would ideally have this live video element in
      // control of the audio, but due to the current method of not rendering
      // the element at all when video is muted we have to rely on the hidden
      // dom element in the sdk driver to play the audio.
      // We might want to consider changing this if we add UI controls relating
      // to the remote audio at some stage in the future.
      return (
        <div className={this.props.mediaType}>
          <div className="remote-video-box">
          {this.state.videoElementSize && this.props.shareCursor ?
            <RemoteCursorView
              videoElementSize={this.state.videoElementSize} /> :
              null}
            <video className={this.props.mediaType + "-video"}
                   muted={true}
                   poster={this.props.posterUrl} />
          </div>
        </div>
      );
    }
  });

  var MediaLayoutView = React.createClass({
    propTypes: {
      children: React.PropTypes.node,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      isLocalLoading: React.PropTypes.bool.isRequired,
      isRemoteLoading: React.PropTypes.bool.isRequired,
      // The poster URLs are for UI-showcase testing and development.
      localPosterUrl: React.PropTypes.string,
      localSrcMediaElement: React.PropTypes.object,
      localVideoMuted: React.PropTypes.bool.isRequired,
      remotePosterUrl: React.PropTypes.string,
      remoteSrcMediaElement: React.PropTypes.object,
      renderRemoteVideo: React.PropTypes.bool.isRequired,
      showMediaWait: React.PropTypes.bool.isRequired
    },

    _shouldShowRemoteStream: function() {
      return this.props.remoteSrcMediaElement ||
        this.props.remotePosterUrl || this.props.isRemoteLoading;
    },

    render: function() {
      var mediaLayoutClasses = classNames({
        "media-layout": true,
        "showing-local-streams": this.props.localSrcMediaElement ||
          this.props.localPosterUrl,
        "showing-media-wait": this.props.showMediaWait,
        "showing-remote-streams": this._shouldShowRemoteStream()
      });

      return (
        <div className={mediaLayoutClasses}>
          <MediaView
            displayAvatar={!this.props.renderRemoteVideo}
            isLoading={this.props.isRemoteLoading}
            mediaType="remote"
            posterUrl={this.props.remotePosterUrl}
            srcMediaElement={this.props.remoteSrcMediaElement} />
          <MediaView
            displayAvatar={this.props.localVideoMuted}
            isLoading={this.props.isLocalLoading}
            mediaType="local"
            posterUrl={this.props.localPosterUrl}
            srcMediaElement={this.props.localSrcMediaElement} />
          <MediaWaitView
            showMediaWait={this.props.showMediaWait} />
        </div>
      );
    }
  });

  var MediaWaitView = React.createClass({
    propTypes: {
      showMediaWait: React.PropTypes.bool.isRequired
    },

    render: function() {
      if (!this.props.showMediaWait) {
        return null;
      }

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
        <div className="prompt-media-message-wrapper">
          <p className={promptMediaMessageClasses}>
            {msg}
          </p>
        </div>
      );
    }
  });

  var MediaButtonsView = React.createClass({
    propTypes: {
      audio: React.PropTypes.object.isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      screen: React.PropTypes.object.isRequired,
      video: React.PropTypes.object.isRequired
    },

    getDefaultProps: function() {
      return {
        video: { enabled: true, visible: true },
        audio: { enabled: true, visible: true },
        screen: { enabled: false, visible: true }
      };
    },

    render: function() {
      return (
        <div className="media-control-buttons">
          <VideoMuteButton
            dispatcher={this.props.dispatcher}
            muted={!this.props.video.enabled} />
          <AudioMuteButton
            dispatcher={this.props.dispatcher}
            muted={!this.props.audio.enabled} />
          {
            loop.shared.utils.isDesktop() ?
              <ScreenShareButton
                dispatcher={this.props.dispatcher}
                muted={!this.props.screen.enabled} /> : null
          }
        </div>
      );
    }
  });

  var RemoteCursorView = React.createClass({
    statics: {
      TRIGGERED_RESET_DELAY: 1000
    },

    mixins: [
      React.addons.PureRenderMixin,
      loop.store.StoreMixin("remoteCursorStore")
    ],

    propTypes: {
      videoElementSize: React.PropTypes.object
    },

    getInitialState: function() {
      return this.getStoreState();
    },

    componentWillMount: function() {
      if (!this.state.realVideoSize) {
        return;
      }

      this._calculateVideoLetterboxing();
    },

    componentWillReceiveProps: function(nextProps) {
      if (!this.state.realVideoSize) {
        return;
      }

      // In this case link generator or link clicker have resized their windows
      // so we need to recalculate the video letterboxing.
      this._calculateVideoLetterboxing(this.state.realVideoSize,
                                       nextProps.videoElementSize);
    },

    componentWillUpdate: function(nextProps, nextState) {
      if (!this.state.realVideoSize || !nextState.realVideoSize) {
        return;
      }

      if (!this.state.videoLetterboxing) {
        // If this is the first time we receive the event, we must calculate the
        // video letterboxing.
        this._calculateVideoLetterboxing(nextState.realVideoSize);
        return;
      }

      if (nextState.realVideoSize.width !== this.state.realVideoSize.width ||
        nextState.realVideoSize.height !== this.state.realVideoSize.height) {
        // In this case link generator has resized his window so we need to
        // recalculate the video letterboxing.
        this._calculateVideoLetterboxing(nextState.realVideoSize);
      }
    },

    _calculateVideoLetterboxing: function(realVideoSize, videoElementSize) {
      realVideoSize = realVideoSize || this.state.realVideoSize;
      videoElementSize = videoElementSize || this.props.videoElementSize;

      var clientWidth = videoElementSize.clientWidth;
      var clientHeight = videoElementSize.clientHeight;
      var clientRatio = clientWidth / clientHeight;
      var realVideoWidth = realVideoSize.width;
      var realVideoHeight = realVideoSize.height;
      var realVideoRatio = realVideoWidth / realVideoHeight;

      // If the video element ratio is "wider" than the video content, then the
      // full client height will be used and letterbox will be on the sides.
      // E.g., video element is 3:2 and stream is 1:1, so we end up with 2:2.
      var isWider = clientRatio > realVideoRatio;
      var streamVideoHeight = isWider ? clientHeight : clientWidth / realVideoRatio;
      var streamVideoWidth = isWider ? clientHeight * realVideoRatio : clientWidth;

      this.getStore().setStoreState({
        videoLetterboxing: {
          left: (clientWidth - streamVideoWidth) / 2,
          top: (clientHeight - streamVideoHeight) / 2
        },
        streamVideoHeight: streamVideoHeight,
        streamVideoWidth: streamVideoWidth
      });
    },

    calculateCursorPosition: function() {
      // We need to calculate the cursor postion based on the current video
      // stream dimensions.
      var remoteCursorPosition = this.state.remoteCursorPosition;
      var ratioX = remoteCursorPosition.ratioX;
      var ratioY = remoteCursorPosition.ratioY;

      var cursorPositionX = this.state.streamVideoWidth * ratioX;
      var cursorPositionY = this.state.streamVideoHeight * ratioY;

      return {
        left: cursorPositionX + this.state.videoLetterboxing.left,
        top: cursorPositionY + this.state.videoLetterboxing.top
      };
    },

    resetClickState: function() {
      this.getStore().setStoreState({
        remoteCursorClick: false
      });
    },

    render: function() {
      if (!this.state.remoteCursorPosition || !this.state.videoLetterboxing) {
        return null;
      }

      var cx = classNames;
      var cursorClasses = cx({
        "remote-cursor-container": true,
        "remote-cursor-clicked": this.state.remoteCursorClick
      });

      if (this.state.remoteCursorClick) {
        setTimeout(this.resetClickState, this.constructor.TRIGGERED_RESET_DELAY);
      }

      return (
        <div className={cursorClasses} style={this.calculateCursorPosition()}>
          <div className="remote-cursor" />
        </div>
      );
    }
  });

  /**
   * Panel settings (gear) menu entry.
   */
  var SettingsDropdownEntry = React.createClass({
    propTypes: {
      disabled: React.PropTypes.bool,
      displayed: React.PropTypes.bool,
      extraCSSClass: React.PropTypes.string,
      label: React.PropTypes.string.isRequired,
      onClick: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
      return { displayed: true };
    },

    render: function() {
      if (!this.props.displayed) {
        return null;
      }

      var cx = classNames;
      var extraCSSClass = {
        "dropdown-menu-item": true
      };
      if (this.props.extraCSSClass) {
        extraCSSClass[this.props.extraCSSClass] = true;
      }

      if (this.props.disabled) {
        extraCSSClass.disabled = true;
      }
      return (
        <li className={cx(extraCSSClass)}
            disabled={!this.props.disabled}
            onClick={this.props.onClick} >
          {this.props.label}
        </li>
      );
    }
  });

  /**
   * Panel settings (gear) menu.
   */
  var SettingsDropdown = React.createClass({
    statics: {
      PREF_DND: "do_not_disturb"
    },

    mixins: [
      sharedMixins.DropdownMenuMixin(),
      sharedMixins.WindowCloseMixin
    ],

    propTypes: {
      // Presumed false if not present
      calledFromPanel: React.PropTypes.bool,
      // EditRoomName is only available to owners from the ToC
      handleEditRoomNameButtonClick: React.PropTypes.func,
      // EditUserName is available to all users
      handleEditUsernameButtonClick: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
      return {
        calledFromPanel: false,
        handleEditRoomNameButtonClick: function foo() {}
      };
    },

    getInitialState: function() {
      return {
        doNotDisturb: loop.getStoredRequest(
                        ["GetLoopPref", this.constructor.PREF_DND]) || false,
        signedIn: loop.getStoredRequest(["GetUserProfile"]) || null
      };
    },

    componentWillUpdate: function(nextProps, nextState) {
      // no need of update if show state is not changing
      if (nextState.showMenu === this.state.showMenu) {
        return;
      }

      loop.requestMulti(
        ["GetLoopPref", this.constructor.PREF_DND],
        ["GetUserProfile"]
      ).then(results => {
        this.setState({
          doNotDisturb: !results[0] || results[0].isError ? false : results[0],
          signedIn: !results[1] || results[1].isError ? false : !!results[1]
        });
      });
    },

    handleClickSettingsEntry: function() {
      // XXX to be implemented at the same time as unhiding the entry
    },

    handleClickAccountEntry: function() {
      loop.request("OpenFxASettings");
      this.closeWindow();
    },

    handleClickAuthEntry: function() {
      if (this.state.signedIn) {
        loop.request("LogoutFromFxA");
        // Close the menu but leave the panel open
        this.hideDropdownMenu();
      } else {
        loop.request("LoginToFxA");
        // Close the panel, the menu will be closed by on blur listener of DropdownMenuMixin
        this.closeWindow();
      }
    },

    /**
     * Allows the ROOM OWNER to change the room name
     */
    handleChangeRoomName: function() {
      if (loop.shared.utils.isDesktop()) {
        this.props.handleEditRoomNameButtonClick();
      }

      this.hideDropdownMenu();
    },

    /**
     * Allows the user to change the username
     * - When called from Hello Panel, it focus on the name input
     * - When called from ToC Settings, it should show the FTU slide
     * where the user chooses the username
     */
    handleChangeUserName: function() {
      // If change username call comes from Loop Panel
      if (this.props.calledFromPanel) {
        this.props.handleEditUsernameButtonClick();
      }
      // XXX change username when not called from panel
      // needs new FTU finished

      this.hideDropdownMenu();
      },

    /**
     * Toggle the Notifications preference for the user
     */
    handleToggleNotifications: function() {
      loop.request("GetLoopPref", this.constructor.PREF_DND)
      .then(result => {
        loop.request("SetLoopPref", this.constructor.PREF_DND, !result);
      });
      this.hideDropdownMenu();
    },

    /**
     *  Opens the FTU on the same tab
     */
    openGettingStartedTour: function() {
      loop.request("OpenGettingStartedTour");
      if (this.props.calledFromPanel) {
        this.closeWindow();
      }
    },

    /**
     * Load the feedback url from prefs on a new tab
     */
    handleSubmitFeedback: function(event) {
      event.preventDefault();
      // It has it's own request instead of just loading a LoopPref
      // because we don't want the manualFormURL stored for guests
      loop.request("SubmitFeedback");

      if (this.props.calledFromPanel) {
        this.closeWindow();
      }
    },

    /**
     * Load the support url from prefs on a new tab
     */
    handleHelpEntry: function(event) {
      event.preventDefault();
      loop.request("GetLoopPref", "support_url")
      .then(helloSupportUrl => {
        loop.request("OpenURL", helloSupportUrl);

        if (this.props.calledFromPanel) {
          this.closeWindow();
        }
      });
    },

    render: function() {
      var cx = classNames;

      var accountAuthLabel = this.state.signedIn ?
                               "settings_menu_item_signout" :
                               "settings_menu_item_signin";

      var notificationsLabel = this.state.doNotDisturb ?
                                  "settings_menu_item_turnnotificationson" :
                                  "settings_menu_item_turnnotificationsoff";

      // Change Room Name option should be displayed only:
      //  - if the user is owner
      //  - it's not called from the Hello Panel
      var displayChangeRoomName = loop.shared.utils.isDesktop() &&
                                  !this.props.calledFromPanel;
      // disable entries without functionality.
      // For now, entries for guest should be disabled
      var disabledEntry = !loop.shared.utils.isDesktop();
      return (
        <div className="settings-menu dropdown">
          <button className="button-settings"
             onClick={this.toggleDropdownMenu}
             ref="menu-button"
             title={mozL10n.get("settings_menu_button_tooltip")} />
          <ul className={cx({
                "dropdown-menu": true,
                "hide": !this.state.showMenu
              })}
              ref="settings-list">
            {/* Change_Room_Name option is hidden for guests */}
            <SettingsDropdownEntry disabled={disabledEntry}
                                   displayed={displayChangeRoomName}
                                   label={mozL10n.get("settings_menu_item_change_roomname")}
                                   onClick={this.handleChangeRoomName}
                                   ref="item-changeRoomName" />
            <SettingsDropdownEntry disabled={disabledEntry}
                                   extraCSSClass="entries-divider"
                                   label={mozL10n.get("settings_menu_item_change_username")}
                                   onClick={this.handleChangeUserName}
                                   ref="item-changeUsername" />
            <SettingsDropdownEntry disabled={disabledEntry}
                                   extraCSSClass="entries-divider"
                                   label={mozL10n.get(notificationsLabel)}
                                   onClick={this.handleToggleNotifications}
                                   ref="item-notifications" />
            <SettingsDropdownEntry disabled={disabledEntry}
                                   label={mozL10n.get("settings_menu_item_starttour")}
                                   onClick={this.openGettingStartedTour} />
            <SettingsDropdownEntry disabled={disabledEntry}
                                   label={mozL10n.get("settings_menu_item_feedback")}
                                   onClick={this.handleSubmitFeedback}
                                   ref="item-feedback" />
            <SettingsDropdownEntry disabled={disabledEntry}
                                   label={mozL10n.get(accountAuthLabel)}
                                   onClick={this.handleClickAuthEntry}
                                   ref="item-signin" />
            <SettingsDropdownEntry disabled={disabledEntry}
                                   label={mozL10n.get("settings_menu_item_help")}
                                   onClick={this.handleHelpEntry}
                                   ref="item-help" />
          </ul>
        </div>
      );
    }
  });

  // XXX akita currently unused. Need to use it or remove it
  var AdsTileView = React.createClass({
    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      showTile: React.PropTypes.bool.isRequired
    },

    componentDidMount: function() {
      // Watch for messages from the waiting-tile iframe
      window.addEventListener("message", this.recordTileClick);
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

    render: function() {
      if (!this.props.showTile) {
        window.removeEventListener("message", this.recordTileClick);
        return null;
      }

      return (
        <div className="ads-tile">
          <div className="ads-wrapper">
            <p>{mozL10n.get("rooms_read_while_wait_offer2")}</p>
            <a href={loop.config.tilesSupportUrl}
              onClick={this.recordTilesSupport}
              rel="noreferrer"
              target="_blank">
              <i className="room-waiting-help"></i>
            </a>
            <iframe className="room-waiting-tile" src={loop.config.tilesIframeUrl} />
          </div>
        </div>
      );
    }
  });

  // XXX akita-sidebar
  var ScreenShareView = React.createClass({
    propTypes: {
      children: React.PropTypes.node,
      cursorStore: React.PropTypes.instanceOf(loop.store.RemoteCursorStore).isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      displayScreenShare: React.PropTypes.bool.isRequired,
      isScreenShareLoading: React.PropTypes.bool.isRequired,
      localSrcMediaElement: React.PropTypes.object,
      screenShareMediaElement: React.PropTypes.object,
      screenSharePosterUrl: React.PropTypes.string,
      screenSharingPaused: React.PropTypes.bool
    },

    render: function() {
      var screenShareStreamClasses = classNames({
        "screen": true,
        // XXX-akita: Remove focus-stream?
        "focus-stream": this.props.displayScreenShare,
        "screen-sharing-paused": this.props.screenSharingPaused
      });

      return (
        <div className={screenShareStreamClasses}>
          <loop.shared.views.MediaView
            cursorStore={this.props.cursorStore}
            dispatcher={this.props.dispatcher}
            displayAvatar={false}
            isLoading={this.props.isScreenShareLoading}
            mediaType="screen-share"
            posterUrl={this.props.screenSharePosterUrl}
            screenSharingPaused={this.props.screenSharingPaused}
            shareCursor={true}
            srcMediaElement={this.props.screenShareMediaElement} />
          {this.props.displayScreenShare ? this.props.children : null}
        </div>
      );
    }
  });

  var EditableFieldView = React.createClass({
    propTypes: {
      forceNotEditable: React.PropTypes.bool,
      label: React.PropTypes.string.isRequired,
      onEditionComplete: React.PropTypes.func
    },

    getDefaultProps: function() {
      return {
        forceNotEditable: false
      };
    },

    getInitialState: function() {
      return {
        editableLabel: this.props.label,
        editMode: false
      };
    },

    shouldComponentUpdate: function(nextProps) {
      return !nextProps.forceNotEditable;
    },

    componentWillReceiveProps: function(nextProps) {
      if (this.props.label === nextProps.label) {
        return;
      }

      this.setState({
        editableLabel: nextProps.label
      });
    },

    componentDidUpdate: function() {
      if (this.state.editMode) {
        this._calculateInputWidth();
        this.refs.editableInput.focus();
      }
    },

    _calculateInputWidth: function() {
      var label = this.refs.editableLabel;
      var input = this.refs.editableInput;
      var realWidth = window.getComputedStyle(label, null).getPropertyValue("width");
      input.style.width = realWidth;
    },

    /**
     * Toggles the edit mode state
     */
    toggleEditMode: function() {
      if (this.state.editMode) {
        this.props.onEditionComplete &&
          this.props.onEditionComplete(this.state.editableLabel);
      }

      this.setState({
        editMode: !this.state.editMode
      });
    },

    /**
     * Handles a key being pressed - looking for the return key for saving
     * the new room name.
     */
    handleKeyDown: function(event) {
      if (event.which === 13) {
        this.toggleEditMode();
      }
    },

    /**
     * Handles a change in the input element - Pushing into the state
     * the new input value
     */
    handleEditInputChange: function(event) {
      this.setState({ editableLabel: event.target.value });
    },

    render: function() {
      if (this.props.forceNotEditable) {
        return (
          <span>{this.state.editableLabel}</span>
        );
      }

      var wrapperCSS = {
        "editable-field": true,
        "edit-mode-enabled": this.state.editMode
      };

      return (
        <div className={classNames(wrapperCSS)}>
          <span
            onClick={this.toggleEditMode}
            ref="editableLabel">
            {this.state.editableLabel}
          </span>
          <input
            className="edit-room-name"
            onBlur={this.toggleEditMode}
            onChange={this.handleEditInputChange}
            onKeyDown={this.handleKeyDown}
            ref="editableInput"
            type="text"
            value={this.state.editableLabel} />
        </div>
      );
    }
  });

  return {
    AdsTileView: AdsTileView,
    AudioMuteButton: AudioMuteButton,
    AvatarView: AvatarView,
    Button: Button,
    ButtonGroup: ButtonGroup,
    ChatPageTileView: ChatPageTileView,
    Checkbox: Checkbox,
    ContextUrlLink: ContextUrlLink,
    ContextUrlView: ContextUrlView,
    ConversationToolbar: ConversationToolbar,
    EditableFieldView: EditableFieldView,
    HangUpControlButton: HangUpControlButton,
    MediaButtonsView: MediaButtonsView,
    MediaControlButton: MediaControlButton,
    MediaLayoutView: MediaLayoutView,
    MediaView: MediaView,
    MediaWaitView: MediaWaitView,
    LoadingView: LoadingView,
    RemoteCursorView: RemoteCursorView,
    SettingsDropdown: SettingsDropdown,
    ScreenShareButton: ScreenShareButton,
    ScreenShareView: ScreenShareView,
    VideoMuteButton: VideoMuteButton
  };
})(_, navigator.mozL10n || document.mozL10n);
