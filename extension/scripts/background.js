var HOST = 'http://104.131.82.233',
    NOTIFICATION_ID = 'arf_notification',
    NOTIFICATION_SRC = chrome.extension.getURL('scripts/notification'),
    STYLES_URL = chrome.extension.getURL('styles.css');


require.config({
});

require(['utils/Ajax', 'widget/BgWidget'], function(Ajax, BgWidget) {
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
      var action = actions[req.action];
      if (action) {
        action(id, req, sender);
      }
    });
    setUpdateSchedule(id);
    setReminderSchedule();
  }

  var searchReq;

  // A set of actions to be taken when a message is received from one
  // of the content scripts.
  var actions = {
    'search' : function(id, req, sender) {
      searchReq = JSON.stringify(req);
      chrome.pageAction.show(sender.tab.id);
      chrome.pageAction.onClicked.addListener(function() {
        Ajax.post(HOST + '/search/' + id)
          .setHeader('Content-Type', 'application/json')
          .send(searchReq);
      });
    },

    'watchSearch' : function(id, req, sender) {
      Ajax.post(HOST + '/search/' + id)
        .setHeader('Content-Type', 'application/json')
        .send(searchReq);
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

  // Check for updates every several minutes
  function setUpdateSchedule(id) {
    setTimeout(checkUpdates.bind(this, id), 5000);
    setInterval(checkUpdates.bind(this, id), 300000);
  }

  var notification = new BgWidget(NOTIFICATION_ID, NOTIFICATION_SRC);
  function checkUpdates(id) {
    Ajax.post(HOST + '/updates/' + id).success(function(res) {
      chrome.tabs.query({currentWindow: true, active : true}, function(tabs) {
        chrome.tabs.insertCSS(tabs[0].id, {file : 'styles.css'});
        notification.inject(tabs[0].id, function() {
            addUpdates(JSON.parse(res), function(storedUpdates) {
              notification.sendMessage(tabs[0].id, storedUpdates);
            });
        });
      });
    }).send();
  }
});

function addUpdates(updates, callback) {
  chrome.storage.sync.get('updates', function(res) {
    var storedUpdates = res.updates ? JSON.parse(res.updates) : {};

    for(var phrase in updates) {
     if (!storedUpdates[phrase]) {
       storedUpdates[phrase] = [];
     }
      storedUpdates[phrase] = storedUpdates[phrase].concat(updates[phrase]);
    }

    chrome.storage.sync.set({'updates': JSON.stringify(storedUpdates)}, callback.bind(this, storedUpdates));
  });
}
