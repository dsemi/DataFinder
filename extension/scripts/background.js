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

  function idReady(id) {
    console.log(id);
  }
});
