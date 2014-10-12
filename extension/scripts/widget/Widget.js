define(function() {
    var id = queryParams().id,
        readySent = false,
        readyListeners = [],
        Widget;

    Widget = {
        chat : function(options) {
            var port = chrome.runtime.connect({ name : options.greeting });
            setupChat(port, options);
        },

        focus : function() {
            sendFrameCommand('focus');
        },

        hide : function() {
            sendFrameCommand('hide');
        },

        onChat : function(options) {
            chrome.runtime.onConnect.addListener(function(port) {
                // Accepts the connection
                if (!options.accept || options.accept === port.name) {
                    setupChat(port, options);

                    if (options.onBegin) options.onBegin();
                    port.postMessage({ begin : true });
                }
            });
        },

       /**
         *  Receives messages from the background page
         *  @param listener Callback function that will be called when a message for this widget is received.
         *                  The callback has parameters (message, respond, sender)
         *  @return The constructed listener function.  This is needed if a listener should be removed.
         */
        onMessage : function(listener) {
            var genListener = function genListener(req, sender, sendResponse) {
                if (req.action === 'widget' && req.id === id) {
                    listener(req.message, sendResponse, sender);
                }
            };

            chrome.runtime.onMessage.addListener(genListener);
            return genListener;
        },

        /**
         *  Adds event listener to execute when the widget is ready.
         *  @params listener    Function that will be called when the widget is ready.
         */
        onReady : function(listener) {
            readyListeners.push(listener);
        },

        /**
         *  Tells the extension that the widget is loaded and ready to run.
         *  This is normally called automatically when the window is loaded, but
         *  it is possible to call it earlier if needed.
         */
        ready : function() {
            if (!readySent) {
                readySent = true;
                Widget.sendMessage('__ready__', function() {
                    readyListeners.forEach(function(l) {l();});
                    readyListeners = null;
                });
            }
        },

         /**
         *  Sends a message to the background page.
         *  @param message  (optional) A serializable data object to be sent to the background page.
         *  @param onResponse   (optional) A callback function that is called when the background page
         *                      responds to the message.
         */
        sendMessage : function(message, onResponse) {
            chrome.runtime.sendMessage({
                action : 'widget',
                id : id,
                message : message
            }, onResponse);
        },

        show : function() {
            sendFrameCommand('show');
        }
    };

    function setupChat(port, options) {
        var respond = function(msg) { port.postMessage(msg || {}); },
            onEnd = options.onEnd;

        respond.goodbye = function() {
            port.disconnect();
            if (onEnd) onEnd();
        };

        port.onMessage.addListener(function(msg) {
            options.onMessage(msg, respond);
        });

       if (onEnd)
           port.onDisconnect.addListener(onEnd);
    }

    function sendFrameCommand(action) {
        var message = {
            action : action,
            id : id,
            isFromWidget : true
        };

        window.parent.postMessage(message, '*');
    }

    function queryParams() {
        var paramString, result, params;

        paramString = window.location.search.substring(1, window.location.search.length);
        params = paramString.split('&');
        result = {};

        if (params[0] === '') return {};

        var pair;

        for (var i = 0; i < params.length; i++) {
            pair = params[i].split('=');
            result[pair[0]] = pair[1];
        }

        return result;
    }

    return Widget;

});
