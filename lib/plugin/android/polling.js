var cordova = require('cordova'),
    period = 50,
    polling = function() {
      // Exit if shutting down app
      if (cordova.shuttingDown) {
          return;
      }

      // If polling flag was changed, stop using polling from now on and switch to XHR server / callback
      if (!cordova.UsePolling) {
          require('cordova/plugin/android/callback')();
          return;
      }

      var msg = prompt("", "gap_poll:");
      if (msg) {
          setTimeout(function() {
              try {
                  var t = eval(""+msg);
              }
              catch (e) {
                  console.log("JSCallbackPolling: Message from Server: " + msg);
                  console.log("JSCallbackPolling Error: "+e);
              }
          }, 1);
          setTimeout(polling, 1);
      }
      else {
          setTimeout(polling, period);
      }
};

module.exports = polling;
