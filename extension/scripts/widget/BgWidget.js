define(function(require) {
    // CONSTANTS
    var WIDGET_LOADER_PATH = '' + require.toUrl('./widget-loader.js'),
        HTML_PAGE_NAME = '/index.html';

    // CONSTRUCTOR

    /**
     * Creates a new widget instance for injecting and communicating with page widgets.
     * @param {String} id   Unique HTML id of the Widget's frame.  Also used for communication purposes.
     * @param {String} src  The URL to the widget page.  Assumes page name of index.html if directory given.
     */
    var Widget = function(id, src) {
        this.id = id;
        this.src = src.match('.html') ? src : src + HTML_PAGE_NAME;
   };

    // METHODS
    Widget.prototype = {
        chat : function(tabId, options) {
            var port = chrome.tabs.connect(tabId, { name : options.greeting });
            setupChat(port, options);
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
         *  Sends a message to the widget embeded in the webpage.
         *  @param  tabIb   The id of the tab that the widget is located
         *  @param  message (optional) Serializable message that will be sent to the widget
         *  @param  onReponse   (optional) Callback that is called when widget responds to message.
         *                      Callback function has parameter (message) with the response data.
         */
        sendMessage : function(tabId, message, onResponse) {
            chrome.tabs.sendMessage(tabId, {
                action : 'widget',
                id : this.id,
                message : message
            }, onResponse);
        },

        /**
         *  Receives messages from the embeded widget
         *  @param listener Callback function that will be called when a message from this widget is received.
         *                  The callback has parameters (message, respond, sender)
         *  @param options  An object containing additional options.
         *                  Options
         *                  ready : boolean, whether to only respond to the ready message
         *  @return The constructed listener function.  This is needed if a listener should be removed.
         */
        onMessage : function(listener, options) {
            var id = this.id;

            var genListener = function(req, sender, sendResponse) {
                if (req.action === 'widget' && req.id === id) {
                    if (req.message === '__ready__') {
                        if (options && options.ready) listener(req.message, sendResponse, sender);
                    } else {
                        listener(req.message, sendResponse, sender);
                    }
                }
            };

            chrome.runtime.onMessage.addListener(genListener);
            return genListener;
        },

        /**
         *  Removes a message listener from the widget.  Be careful to use the listener
         *  function that is returned from onMessage()!
         *  @param listener A generated listener function returned from onMessage()
         */
        unMessage : function(listener) {
            chrome.runtime.onMessage.removeListener(listener);
        },

        /**
         *  Injects the widget into the webpage of the specified tab.  If the widget is already
         *  injected then nothing happens.
         *  @param  tabId   The identification number of the tab to inject the widget
         *  @param  callback    Callback function to call when the injection completes.  Even if
         *                      nothing is injected, the callback is still executed.
         */
        inject : function(tabId, callback) {
            var id = this.id,
                src = this.src,
                unMessage = this.unMessage;

            var listener = this.onMessage(function(message, respond) {
                unMessage(listener);
                respond();
                callback();
            }, {ready : true});

            injectWidgetLoader(tabId, function() {
                 chrome.tabs.sendMessage(tabId, {
                     action : 'loadWidget',
                     id : id,
                     src : src
                 }, function() {
                     unMessage(listener);
                     callback();
                 });
            });
        }
    };

    return Widget;

    // PRIVATE HELPER FUNCTIONS
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

    function injectWidgetLoader(tabId, callback) {

        var injectionListener = function(req) {
            if (req.action === 'injectionResponse') {
               if (req.injected) {
                    callback();
                } else {
                    chrome.tabs.executeScript(tabId, {file:WIDGET_LOADER_PATH}, callback);
                }

                chrome.extension.onMessage.removeListener(injectionListener);
            }
        };

        chrome.extension.onMessage.addListener(injectionListener);

        chrome.tabs.executeScript(tabId, {
            code: "chrome.extension.sendMessage({action:'injectionResponse',injected:this.WidgetLoaderInjected || false});this.WidgetLoaderInjected=true;"
        });
    }
});
