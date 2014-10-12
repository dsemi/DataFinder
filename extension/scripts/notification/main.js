require.config({
  baseUrl : '/scripts/'
});

require(['widget/Widget'], function(Widget) {
  var updates = {},
//      frame = document.getElementById('frame'),
      updateUrl = document.getElementById('update_url');

  Widget.onMessage(function(res) {
    updates = res;
    nextUpdate();
  });

  document.getElementById('dismiss_button').onclick = function() {
    Widget.hide();
  };

  document.querySelector('.left-arrow').onclick = function() {
    previousUpdate();
  };

  document.querySelector('.right-arrow').onclick = function() {
    nextUpdate();
  };

  function previousUpdate() {
    var phrase = Object.keys(updates)[0];
    var update = updates[phrase].pop();

    updates[phrase].splice(0, 0, update);
    updateUrl.innerText = update;
    updateUrl.href = update;
  }

  function nextUpdate() {
    var phrase = Object.keys(updates)[0];
    var update = updates[phrase].shift();

    updates[phrase].push(update);
    updateUrl.innerText = update;
    updateUrl.href = update;
  }

  function nextPhrase() {
    // To implement
    nextUpdate();
  }

  Widget.ready();
});
