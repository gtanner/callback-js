(function (context) {
    var channel = require("cordova/channel"),
        /**
         * cordova Channels that must fire before "deviceready" is fired.
         */ 
        deviceReadyChannelsArray = [channel.onCordovaReady, channel.onCordovaInfoReady, channel.onCordovaConnectionReady],
        deviceReadyChannelsMap = {},
        _self = {
            boot: function () {
                //---------------
                // Event handling
                //---------------

                /**
                 * Listen for DOMContentLoaded and notify our channel subscribers.
                 */ 
                document.addEventListener('DOMContentLoaded', function() {
                    channel.onDOMContentLoaded.fire();
                }, false);
                if (document.readyState == 'complete') {
                  channel.onDOMContentLoaded.fire();
                }

                /**
                 * Create all cordova objects once page has fully loaded and native side is ready.
                 */
                channel.join(function() {
                    var builder = require('cordova/builder'),
                        base = require('cordova/common'),
                        platform = require('cordova/platform');

                    // Drop the common globals into the window object, but be nice and don't overwrite anything.
                    builder.build(base.objects).intoButDontClobber(window);

                    // Drop the platform-specific globals into the window object and do it like a honey badger does it.
                    builder.build(platform.objects).intoAndClobberTheFOutOf(window);

                    // Call the platform-specific initialization
                    platform.initialize();

                    // Fire event to notify that all objects are created
                    channel.onCordovaReady.fire();

                    // Fire onDeviceReady event once all constructors have run and 
                    // cordova info has been received from native side.
                    channel.join(function() {
                        channel.onDeviceReady.fire();
                        
                        // Fire the onresume event, since first one happens before JavaScript is loaded
                        channel.onResume.fire();
                    }, deviceReadyChannelsArray);
                    
                }, [ channel.onDOMContentLoaded, channel.onNativeReady ]);
            }
        };
    // boot up once native side is ready
    channel.onNativeReady.subscribe(_self.boot);

    // _nativeReady is global variable that the native side can set
    // to signify that the native code is ready. It is a global since 
    // it may be called before any cordova JS is ready.
    if (window._nativeReady) {
        channel.onNativeReady.fire(); 
    }

}(window));
