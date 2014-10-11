var hostname = window.location.hostname,
    phrase;

if (hostname === 'www.google.com') {
  // The user searches for something new without reloading Google.
  window.onhashchange = function() {
    var phrase = window.location.hash.replace('#q=', '').replace(/\+/g, ' ');
    sendSearchMessage(phrase);
  };

  // There is already a search when Google loads.
  var phrase = window.location.search.match(/q=(.*?)&/)[1].replace(/\+/g, ' ');
  sendSearchMessage(phrase);
}

function sendSearchMessage(phrase) {
  console.log(phrase);
  chrome.runtime.sendMessage({
      action : 'search',
      phrase : phrase
  });
}
