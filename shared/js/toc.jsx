/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.shared = loop.shared || {};

loop.shared.toc = (function() {
  "use strict";

  var TableOfContentView = React.createClass({
    propTypes: {
      activeRoomStore: React.PropTypes.instanceOf(loop.store.ActiveRoomStore).isRequired,
      isDesktop: React.PropTypes.bool.isRequired
    },

    getInitialState: function() {
      return this.props.activeRoomStore.getStoreState();
    },

    componentWillMount: function() {
      this.props.activeRoomStore.on("change", this.onStoreChange);
    },

    componentWillUnmount: function() {
      this.props.activeRoomStore.off("change", this.onStoreChange);
    },

    componentDidMount: function() {
      if (this.props.isDesktop) {
        document.body.classList.add("desktop-toc");
      }
    },

    onStoreChange: function() {
      var newState = this.props.activeRoomStore.getStoreState();
      var tiles = newState.roomContextUrls ? [newState.roomContextUrls[0]] : [];
      newState.tiles = tiles;
      this.setState(newState);
    },

    addTile: function(url) {
      var tiles = this.state.tiles;
      tiles.push({
        location: url,
        description: url
      });

      this.setState({
        tiles: tiles
      });
    },

    render: function() {
      return (
        <div className="toc-wrapper">
          <RoomInfoBarView
            addUrlTile={this.addTile}
            isDesktop={this.props.isDesktop} />
          <RoomContentView
            tiles={this.state.tiles} />
        </div>
      );
    }
  });

  var RoomInfoBarView = React.createClass({
    propTypes: {
      addUrlTile: React.PropTypes.func.isRequired,
      isDesktop: React.PropTypes.bool.isRequired
    },

    getInitialState: function() {
      return {
        editMode: false,
        roomName: "#ROOM NAME"
      };
    },

    toggleEditMode: function() {
      this.setState({
        editMode: true
      });
    },

    /**
     * Handles a key being pressed - looking for the return key for saving
     * the new room name.
     */
    handleKeyDown: function(event) {
      if (event.which === 13) {
        this.exitEditMode();
      }
    },

    exitEditMode: function() {
      this.setState({ editMode: false });
    },

    handleEditInputChange: function(event) {
      this.setState({ roomName: event.target.value });
    },

    render: function() {
      return (
        <div className="toc-room-info-bar">
          <div className="room-name">
            {
              !this.state.editMode ?
              <h1 onClick={this.toggleEditMode}>{this.state.roomName}</h1> :
              <input
                className="edit-room-name"
                onBlur={this.exitEditMode}
                onChange={this.handleEditInputChange}
                onKeyDown={this.handleKeyDown}
                type="text"
                value={this.state.roomName} />
            }
          </div>
          <RoomPresenceView />
          <RoomActionsView
            addUrlTile={this.props.addUrlTile}
            isDesktop={this.props.isDesktop} />
        </div>
      );
    }
  });

  var RoomPresenceView = React.createClass({
    propTypes: {},

    render: function() {
      return (
        <div className="room-active-users">
          <div className="room-user" data-name="Pau Masiá">
            <span>P</span>
          </div>
          <div className="room-user" data-name="Manu">
            <span>M</span>
          </div>
        </div>
      );
    }
  });

  var RoomActionsView = React.createClass({
    propTypes: {
      addUrlTile: React.PropTypes.func.isRequired,
      isDesktop: React.PropTypes.bool.isRequired
    },

    getInitialState: function() {
      return {
        showAddUrlPanel: false
      };
    },

    toggleAddUrlPanel: function() {
      this.setState({
        showAddUrlPanel: !this.state.showAddUrlPanel
      });
    },

    handleAddUrlClick: function(url) {
      this.toggleAddUrlPanel();
      this.props.addUrlTile(url);
    },

    render: function() {
      return (
        <div className="room-actions-buttons">
          <div className="room-action-add-url">
            <button className="add-url" onClick={this.toggleAddUrlPanel} />
            {
              this.state.showAddUrlPanel ?
                <AddUrlPanelView
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
      handleAddUrlClick: React.PropTypes.func.isRequired
    },

    handleClick: function(event) {
      event.preventDefault();
      var input = this.refs.siteUrl.getDOMNode();
      input.value && this.props.handleAddUrlClick(input.value);
    },

    render: function() {
      return (
        <div className="room-panel-add-url">
          <h2>Add a site to the room</h2>
          <input placeholder="http://..." ref="siteUrl" type="text" />
          <button onClick={this.handleClick}>Add site</button>
        </div>
      );
    }
  });

  var RoomContentView = React.createClass({
    propTypes: {
      tiles: React.PropTypes.array
    },

    getDefaultProps: function() {
      return {
        tiles: []
      };
    },

    render: function() {
      return (
        <div className="room-toc">
          {
            this.props.tiles.map(function(tile, index) {
              return (
                <TileView
                  key={index}
                  tile={tile} />
              );
            }, this)
          }
        </div>
      );
    }
  });

  var TileView = React.createClass({
    statics: {
      GOOGLE_SCREENSHOT: "https://www.googleapis.com/pagespeedonline/v1/runPagespeed?screenshot=true&strategy=desktop&url="
    },

    propTypes: {
      tile: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
      return {
        screenshot: null
      };
    },

    componentWillMount: function() {
      var xhr = new XMLHttpRequest();
      var url = this.constructor.GOOGLE_SCREENSHOT + this.props.tile.location;

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var response = JSON.parse(xhr.response).screenshot;
          console.info(JSON.parse(xhr.response).screenshot);
          var src = "data:" + response.mime_type + ";base64,";
          var base64 = response.data;
          base64 = base64.replace(/\_/g, "/");
          base64 = base64.replace(/\-/g, "+");
          src += base64;
          this.setState({
            screenshot: src
          });
        }
      }.bind(this);
      xhr.open("GET", url, true);
      xhr.send();
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      return nextState.screenshot !== this.state.screenshot;
    },

    render: function() {
      return (
        <div className="toc-tile">
          <div className="room-user" data-name="Pau Masiá">
            <span>P</span>
          </div>
          <img className="tile-screenshot" src={this.state.screenshot} />
          <div className="tile-info">
            <a
              className="tile-name"
              href={this.props.tile.location}
              title={this.props.tile.description}>
                {this.props.tile.description}
            </a>
            <h3 className="tile-url">{this.props.tile.location}</h3>
          </div>
        </div>
      );
    }
  });

  return {
    TableOfContentView: TableOfContentView
  };
})();
