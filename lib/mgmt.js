
var App = require(__dirname + '/app'),
    DOMRequest = require(__dirname + '/domrequest'),
    fs = require('fs');


/**
 * @constructor
 * @param {Apps} apps A reference to the Apps api.
 * @param {Marionette.Client} client Marionette client to use.
 */
function Mgmt(apps, client) {
  this._apps = apps;
  this._client = client;
}
module.exports = Mgmt;


Mgmt.prototype = {
  /**
   * @type {Apps}
   * @private
   */
  _apps: undefined,


  /**
   * @type {Marionette.Client}
   * @private
   */
  _client: undefined,

  /**
   * Lists all installed apps in the user's repository.
   * @return {DOMRequest} Request that supports onsuccess, onerror callbacks.
   */
  getAll: function() {
    var req = new DOMRequest();

    var script = fs.readFileSync(
      __dirname + '/scripts/getallapps.js',
      'utf8'
    );

    this._client.executeAsyncScript(script, (function(err, result) {
      if (err) {
        throw err;
      }

      result = JSON.parse(result);
      switch (result.callbackType) {
        case DOMRequest.CallbackType.ON_SUCCESS:
          var apps = result.data.map((function(data) {
            var app = new App(this._apps);
            for (var key in data) {
              app[key] = data[key];
            }

            return app;
          }).bind(this));

          req.onsuccess && req.onsuccess({ target: { result: apps } });
          break;
        case DOMRequest.CallbackType.ON_ERROR:
          req.onerror && req.onerror();
          break;
      }
    }).bind(this));

    return req;
  }
};