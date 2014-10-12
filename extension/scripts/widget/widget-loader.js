(function() {
    // Attempts to a widget when prompted by the extension
    chrome.runtime.onMessage.addListener(
        function(req, sender, sendResponse) {
            if (!sender.tab && req.action === 'loadWidget') {
                if (widgetIsLoaded(req.id))
                    sendResponse();
                else
                    loadWidget(req.id, req.src);
            }
    });

    function widgetIsLoaded(id) {
        return document.getElementById(id) !== null;
    }

    function loadWidget(id, src) {
        var iframe = document.createElement('iframe');
        iframe.id = id;
        iframe.frameBorder = '0';
        iframe.scrolling = 'no';
        iframe.src = src + '?id=' + id;
        document.body.appendChild(iframe);
    }

    // Communications between widgets and the webpage are handled here.
    window.addEventListener('message', function(e) {
        var data = e.data;
        if (data.isFromWidget) actions[data.action](data.id);
    }, false);

    var actions = {
        focus : function(id) {
            document.getElementById(id).focus();
        },

        hide : function(id) {
            document.getElementById(id).style.display = 'none';
        },

        show : function(id) {
            document.getElementById(id).style.display = 'inherit';
        }
    };
})();
