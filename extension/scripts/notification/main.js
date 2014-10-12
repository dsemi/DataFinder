require.config({
  baseUrl : '/scripts/'
});

require(['widget/Widget'], function(Widget) {
  var updates = {},
//      frame = document.getElementById('frame'),
      phraseSpan = document.getElementById('phrase'),
      updateUrl = document.getElementById('update_url'),
      currentPhrase = 0;

  Widget.onMessage(function(res) {
    updates = res;
    nextUpdate();
  });

  document.getElementById('dismiss_button').onclick = function() {
    Widget.hide();
  };

  document.getElementById('left-arrow').onclick = function() {
    previousUpdate();
  };

  document.getElementById('left-arrow-double').onclick = function() {
    previousPhrase();
  };

  document.getElementById('right-arrow').onclick = function() {
    nextUpdate();
  };

  document.getElementById('right-arrow-double').onclick = function() {
    nextPhrase();
  };

  function previousUpdate() {
    var phrase = Object.keys(updates)[currentPhrase];
    var update = updates[phrase].pop();

    updates[phrase].splice(0, 0, update);
    updateUrl.innerText = update;
    updateUrl.href = update;
    phraseSpan.innerText = phrase.replace(/\+/g, ' ');

    Widget.sendMessage({
      action: 'notificationRead',
      phrase: phrase,
      url: update
    });
  }

  function nextUpdate() {
    var phrase = Object.keys(updates)[currentPhrase];
    var update = updates[phrase].shift();

    updates[phrase].push(update);
    updateUrl.innerText = update;
    updateUrl.href = update;
    phraseSpan.innerText = phrase.replace(/\+/g, ' ');

    Widget.sendMessage({
      action: 'notificationRead',
      phrase: phrase,
      url: update
    });
  }

  function nextPhrase() {
    currentPhrase = (currentPhrase + 1) % Object.keys(updates).length;
    nextUpdate();
  }

  function previousPhrase() {
    currentPhrase = Math.abs((currentPhrase - 1) % Object.keys(updates).length);
    previousUpdate();
  }

  Widget.ready();
});
