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

  /**
   * Callback for when the id has been successfully loaded or retrieved from the server.
   * @param {number} id
   */
  function idReady(id) {
    chrome.runtime.onMessage.addListener(function(req, sender) {
      actions[req.action](id, req, sender);
    });
    setReminderSchedule();
  }

  // A set of actions to be taken when a message is received from one
  // of the content scripts.
  var actions = {
    'search' : function(id, req, sender) {
      chrome.pageAction.show(sender.tab.id);
      Ajax.post(HOST + '/search/' + id)
        .setHeader('Content-Type', 'application/json')
        .send(JSON.stringify(req));
    },

    'alarm' : function(id, req, sender) {
      var date = req.date;
      if (date) {
        setAlarm(date, req.phrase, function(){});
      }
    }
  };

  function setAlarm(date, phrase, callback) {
    chrome.storage.sync.get('reminders', function(res) {
      var reminders = res.reminders ? JSON.parse(res.reminders) : {};

      if (!reminders[date]) {
        reminders[date] = [];
      }

      reminders[date].push(phrase);

      chrome.storage.sync.set({'reminders': JSON.stringify(reminders)}, callback);
    });
  }

  function setReminderSchedule() {
    sendTodaysReminders();
    setInterval(function() {
      sendTodaysReminders();
    }, 864000);
  }

  function sendTodaysReminders() {
    getTodaysReminders(function(reminders) {
      console.log(reminders);
    });
  }

  function getTodaysReminders(callback) {
    chrome.storage.sync.get('reminders', function(res) {
      var reminders = res.reminders ? JSON.parse(res.reminders) : {};
      callback(reminders[new Date().toDateString()]);
    });
  }

});
