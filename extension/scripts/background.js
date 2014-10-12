var HOST = 'http://104.131.82.233';

require.config({

});

require(['utils/Ajax'], function(Ajax) {
  // Retrieve this user's UUID
  chrome.storage.sync.get('id', function(data) {
    var id = data.id;
    if (!id) {
      Ajax.post(HOST + '/getid').success(function(res) {
        id = res;
        chrome.storage.sync.set({'id': id}, idReady.bind(this, id));
      }).send();
    } else {
      idReady(id);
    }
  });

  // A set of actions to be taken when a message is received from one
  // of the content scripts.
  var actions = {
    'search' : function(id, req) {
      Ajax.post(HOST + '/search/' + id)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify(req));
    }
  };

  /**
   * Callback for when the id has been successfully loaded or retrieved from the server.
   * @param {number} id
   */
  function idReady(id) {
    console.log(id);

    chrome.runtime.onMessage.addListener(function(req) {
      actions[req.action](id, req);
    });
  }
});
