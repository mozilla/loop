/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.DataDriver = function() {
  "use strict";

  let { actions } = loop.shared;

  /**
   * Generate an id based on a time. Declared outside of the class to use
   * locally scoped variables.
   * https://gist.github.com/mikelehen/3596a30bd69384624c11
   *
   * @param {Number} time The time to generate the id from.
   *
   * @return {String}
   */
  let makeId = function() {
    let CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUV" +
                "WXYZ_abcdefghijklmnopqrstuvwxyz~",
        lastRandChars = [],
        lastTime;

    return time => {
      let duplicateTime = time === lastTime;
      lastTime = time;

      let timeStampChars = [];
      for (let i = 7; i >= 0; i--) {
        timeStampChars.unshift(CHARS.charAt(time % 64));
        time = Math.floor(time / 64);
      }
      if (time !== 0) {
        throw new Error("We should have converted the entire timestamp.");
      }

      let id = timeStampChars.join("");
      if (duplicateTime) {
        let i;
        for (i = 11; i >= 0 && lastRandChars[i] === 63; i--) {
          lastRandChars[i] = 0;
        }
        lastRandChars[i]++;
      }
      else {
        for (let i = 0; i < 12; i++) {
          lastRandChars[i] = Math.floor(Math.random() * 64);
        }
      }
      for (let i = 0; i < 12; i++) {
        id += CHARS.charAt(lastRandChars[i]);
      }
      if (id.length !== 20) {
        throw new Error("Length should be 20.");
      }

      return id;
    };
  }();

  return class DataDriver {
    /** ************ **
     *** DataDriver ***
     ** ************ **/

    /**
     * Create a DataDriver ready to initialize server connections.
     *
     * @param {Object} options Options for the driver. Must contain dispatcher.
     */
    constructor(options) {
      if (!options.dispatcher) {
        throw new Error("Missing option dispatcher");
      }

      this._retryTimeout = this.INITIAL_RETRY_TIMEOUT;

      this._dispatcher = options.dispatcher;
      this._dispatcher.register(this, [
        "fetchServerData",
        "setupWindowData"
      ]);
    }

    /**
     * Add a page to the room's table of contents.
     *
     * @param {Object} page      The page object to add.
     */
    addPage(page) {
      this.update("page", this.makeId(), page);
    }

    /**
     * Send a text chat message by storing in the database.
     *
     * @param {Object} message The message to be stored and received by others.
     */
    sendTextChatMessage(message) {
      this.update("chat", this.makeId(), message);
    }

    /**
     * Update the current user's participant record.
     *
     * @param {String} userId      The id to associate with stored participant.
     * @param {Object} participant The data to be stored and received by others.
     */
    updateCurrentParticipant(userId, participant) {
      // XXX akita bug 1276095: Verify userId is a valid firebase id.
      this.update("participant", userId, participant);
    }

    /**
     * Update the current user's presence record.
     *
     * @param {String}  userId   The id to associate with stored presence.
     * @param {Boolean} isHere   Is the current user here (true) or left (false)?
     * @param {Object}  presence The data to be stored and received by others.
     */
    updateCurrentPresence(userId, isHere, presence) {
      // XXX akita bug 1276095: Verify userId is a valid firebase id.
      this.update("presence", userId, Object.assign({ isHere }, presence));
    }

    /** **************** **
     *** Action Handler ***
     ** **************** **/

    /**
     * Handle fetchServerData action by connecting to the room.
     *
     * @param {Object} options with items:
     *  - {String} token The room token.
     */
    fetchServerData({ token }) {
      this._connectToRoom(token);
    }

    /**
     * Handle setupWindowData action by connecting to the room.
     *
     * @param {Object} options with items:
     *  - {String} roomToken The room token.
     */
    setupWindowData({ roomToken }) {
      this._connectToRoom(roomToken);
    }

    /** *************** **
     *** EventListener ***
     ** *************** **/

    /**
     * Handle various events from addEventListener.
     *
     * @param {Object} event Event being handled.
     */
    handleEvent(event) {
      switch (event.type) {
        // Handle EventSource successfully connecting.
        case "open":
          this._retryTimeout = this.INITIAL_RETRY_TIMEOUT;
          // XXX akita bug 1274103: Refine usage of this action.
          this._dispatcher.dispatch(new actions.DataChannelsAvailable({
            available: true
          }));
          break;

        // Handle EventSource receiving new data.
        case "put":
          try {
            // Ignore initial put from connecting.
            let { data, path } = JSON.parse(event.data);
            if (path === "/") {
              return;
            }

            // Remove the leading "/" from the path.
            this._processRecord(path.slice(1), data);
          } catch (ex) {
            console.log(`Error handling EventSource.put: ${event.data}`, ex);
          }
          break;

        // Handle an error from being unable to initially connect or
        // unexpected disconnection of an open connection.
        // Chrome follows the spec more closely than Firefox, and is
        // able to recover from transient network conditions more reliably.
        // Chrome will try to reconnect on error, still sending an error event,
        // but readyState will be CONNECTING instead of CLOSED. In this
        // case, we can just ignore the error event. Firefox sometimes sends
        // an error event when readyState is CLOSED. At this point Firefox will
        // not do anything to attempt to recover the connection, and thus
        // this code runs to attempt to reconnect manually.
        case "error":
          if (this._sse.readyState === this._sse.CLOSED) {
            this._sse.removeEventListener("open", this);
            this._sse.removeEventListener("put", this);
            this._sse.removeEventListener("error", this);
            this._sse = null;
            setTimeout(() => this._connectToRoom(), this._retryTimeout);
            this._retryTimeout *= 2;
          }
          break;
      }
    }

    /** ************* **
     *** Data Source ***
     ** ************* **/

    /**
     * Get the base url for the Firebase connection.
     */
    get BASE_FIREBASE() {
      // XXX akita bug 1274107: Get dynamic url from loop-server.
      return "https://blinding-fire-8842.firebaseio.com/loop-test";
    }

    /**
     * Get the initial retry delay, in ms.
     */
    get INITIAL_RETRY_TIMEOUT() {
      return 2000;
    }

    /**
     * Get the maximum query limit value: 2^31 - 1.
     */
    get MAX_LIMIT() {
      return 2147483647;
    }

    /**
     * Get the server time for a local time or now.
     *
     * @param {Number} time The local time to convert to server time defaulting
     *                      to current local time.
     *
     * @return {Number}
     */
    getServerTime(time = Date.now()) {
      return (this._clockSkew || 0) + time;
    }

    /**
     * Generate an id based on the time.
     *
     * @param {Number} time The time to use generating an id defaulting to
     *                      current server time.
     *
     * @return {String}
     */
    makeId(time = this.getServerTime()) {
      // Call the function that has locally scoped state.
      return makeId(time);
    }

    /**
     * Request the most recent chat messages between two times.
     *
     * @param {Number} startTime Beginning time range of chat to fetch
     *                           defaulting to start of time.
     * @param {Number} endTime   End time range of chat to fetch defaulting to
     *                           current server time.
     * @param {Number} limit     Maximum chat messages preferring newer ones
     *                           defaulting to unlimited with special value 0.
     *
     * @return {Promise} Resolved with an {Object} with keys of record ids.
     */
    requestChat(startTime = 0, endTime = this.getServerTime(), limit = 0) {
      let query = this._buildQuery({
        orderBy: '"$key"',
        // Fudge the time to get an inclusive range with the random parts.
        startAt: `"chat!${this.makeId(Math.max(0, startTime - 1))}"`,
        endAt: `"chat!${this.makeId(endTime + 1)}"`,
        // Always have a limit to get things sorted correctly.
        limitToLast: limit > 0 ? limit : this.MAX_LIMIT
      });
      return this._request("GET", this._buildUrl(), query);
    }

    /**
     * Request all room data except for chat.
     *
     * @return {Promise} Resolved with an {Object} with keys of record ids.
     */
    requestRoomData() {
      let query = this._buildQuery({
        orderBy: '"$key"',
        // NB: All record types must come lexicographically after "chat" for
        // this query to request all records except for type "chat".
        startAt: '"chat~"',
        // NB: Firebase requires a limit to have things sorted correctly.
        limitToLast: this.MAX_LIMIT
      });
      return this._request("GET", this._buildUrl(), query);
    }

    /**
     * Update a record additionally storing the timestamp.
     *
     * @param {String} type  Type of record to update.
     * @param {String} id    Id of record to update.
     * @param {Mixed}  value Some value to store for the record.
     *
     * @return {Promise} Resolved with an {Object} of the updated record.
     */
    update(type, id, value) {
      // XXX akita bug 1274110: Validate for certain types.
      let key = `${type}!${id}`;
      return this._request("PUT", this._buildUrl(key), {
        "timestamp": {
          ".sv": "timestamp"
        },
        value: value
      });
    }

    /** ****************** **
     *** Internal Helpers ***
     ** ****************** **/

    /**
     * Convert an object with key/value pairs into a query string.
     *
     * @param {Object} object Pairs of keys and values for the query.
     *
     * @return {String}
     */
    _buildQuery(object) {
      return Object.keys(object).map(key => encodeURIComponent(key) + "=" +
        encodeURIComponent(object[key])).join("&");
    }

    /**
     * Get a REST endpoint for a resource defaulting to the current room.
     *
     * @param {String} resource  The resource endpoint defaulting to the base.
     * @param {String} roomToken The room to scope the resource defaulting to
     *                           the connected room.
     *
     * @return {String}
     */
    _buildUrl(resource = "", roomToken = this._roomToken) {
      resource = encodeURIComponent(resource);
      roomToken = encodeURIComponent(roomToken);
      return `${this.BASE_FIREBASE}/${roomToken}/${resource}.json`;
    }

    /**
     * Connect to a specified room for streaming updates and future requests
     * then initialize with existing data.
     *
     * @param {String} token The room token to use for connections defaulting to
     *                       the current room for reconnect.
     */
    _connectToRoom(token = this._roomToken) {
      this._roomToken = token;
      this._sse = new EventSource(this._buildUrl() + "?" + this._buildQuery({
        limitToLast: 1,
        orderBy: '"timestamp"'
      }));
      this._sse.addEventListener("open", this);
      this._sse.addEventListener("put", this);
      this._sse.addEventListener("error", this);

      // Determine the clock skew before continuing initialization.
      this.update("meta", "lastConnect").then(({ timestamp }) => {
        this._clockSkew = timestamp - Date.now();
        this._loadExistingData();
      });
    }

    /**
     * Request all desired existing data and process them.
     */
    _loadExistingData() {
      let now = this.getServerTime();
      Promise.all([
        this.requestRoomData(),
        // XXX akita bug 1274129: Allow a configurable time window.
        this.requestChat(now - 24 * 60 * 60 * 1000, now, 25)
      ]).then(([roomData, chatData]) => {
        // Process room data first to get participants then handle chat.
        this._processRecords(roomData);
        this._processRecords(chatData);
      });
    }

    /**
     * Handle a single record dispatching appropriate actions.
     *
     * @param {String} key The record identifier.
     * @param {Object} data with items:
     *  - {Number} timestamp Server timestamp of when the record was modified.
     *  - {Mixed}  value     Stored value for the record.
     */
    _processRecord(key, data) {
      let dispatchAction;
      let dispatchExtra = {};
      // XXX akita bug 1274130: Validate data/key/timestamp before processing.
      let [, type, id] = key.match(/^([^!]+)!(.+)$/);
      switch (type) {
        case "chat":
          dispatchAction = "ReceivedTextChatMessage";
          dispatchExtra = {
            receivedTimestamp: new Date(data.timestamp).toISOString()
          };
          break;

        case "page":
          dispatchAction = "AddedPage";
          break;

        case "participant":
          dispatchAction = "UpdatedParticipant";
          dispatchExtra = {
            userId: id
          };
          break;

        case "presence":
          dispatchAction = "UpdatedPresence";
          dispatchExtra = {
            pingedAgo: this.getServerTime() - data.timestamp,
            userId: id
          };
          break;
      }

      // Dispatch the desired action with an object that combines the record's
      // value and any additional keys without modifying the data parameter.
      if (dispatchAction) {
        this._dispatcher.dispatch(new actions[dispatchAction](Object.assign({},
          data.value, dispatchExtra)));
      }
    }

    /**
     * Process multiple records.
     *
     * @param {Object} records A collection of records with each id as keys.
     */
    _processRecords(records) {
      if (records !== null) {
        Object.keys(records).map(key => this._processRecord(key, records[key]));
      }
    }

    /**
     * Make a HTTP/REST server request.
     *
     * @param {String} method The type of HTTP request.
     * @param {String} url    Location to make the request.
     * @param {Mixed}  data   Either GET query params or request body.
     *
     * @return {Promise} Resolved with an {Object} of the response.
     */
    _request(method, url, data) {
      let isGet = method === "GET";
      let body = isGet ? undefined : data;
      let query = isGet && data ? `?${data}` : "";
      return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open(method, url + query);
        request.onload = () => {
          if (request.status === 200) {
            resolve(JSON.parse(request.responseText));
          }
          else {
            reject({
              name: "REQUEST_ERROR",
              request
            });
          }
        };
        request.send(JSON.stringify(body) || null);
      });
    }
  };
}();
