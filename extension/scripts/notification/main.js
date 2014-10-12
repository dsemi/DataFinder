require.config({
  baseUrl : '/scripts/'
});

require(['widget/Widget'], function(Widget) {
   Widget.ready();

  document.getElementById('dismiss_button').onclick = function() {
    Widget.hide();
  };
});
