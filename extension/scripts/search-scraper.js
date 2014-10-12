var hostname = window.location.hostname,
    phrase;

if (hostname === 'www.google.com') {
  // The user searches for something new without reloading Google.
  window.onhashchange = function() {
    var phrase = formatSearch(window.location.hash.replace('#q=', ''));
    sendSearchMessage(phrase);
  };

  // There is already a search when Google loads.
  var phrase = formatSearch(window.location.search.match(/q=([^&]*)/)[1]);
  sendSearchMessage(phrase);
}

else if (hostname === 'www.amazon.com') {
  var match = window.location.search.match(/field-keywords=([^&]*)/);
  if (match && match.length >= 2) {
    var phrase = formatSearch(match[1]);
    sendSearchMessage(phrase);
  }
}

else {  // All other websites that might have a search
  var match = window.location.search.match(/[qp]=([^&]*)/);
  if (match && match.length >= 2) {
    var phrase = formatSearch(match[1]);
    sendSearchMessage(phrase);
  }
}

function sendSearchMessage(phrase) {
  console.log(phrase);
  chrome.runtime.sendMessage({
    action: 'search',
    phrase: phrase,
    hostname: window.location.hostname,
    url: window.location.href
  });
}

function formatSearch(phrase) {
  return decodeURIComponent(phrase).replace(/ /g, '+');
}
