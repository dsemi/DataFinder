var hostname = window.location.hostname,
    phrase, match;

if (hostname === 'www.google.com') {
  // The user searches for something new without reloading Google.
  window.onhashchange = function() {
    phrase = formatSearch(window.location.hash.replace('#q=', ''));
    sendSearchMessage(phrase);
  };

  // There is already a search when Google loads.
  phrase = formatSearch(window.location.search.match(/q=([^&]*)/)[1]);
  sendSearchMessage(phrase);
}

else if (hostname === 'www.amazon.com') {
  match = window.location.search.match(/field-keywords=([^&]*)/);
  if (match && match.length >= 2) {
    phrase = formatSearch(match[1]);
    sendSearchMessage(phrase);
  }
}

else {  // All other websites that might have a search
  match = window.location.search.match(/[qp]=([^&]*)/);
  if (match && match.length >= 2) {
    phrase = formatSearch(match[1]);
    sendSearchMessage(phrase);
  }
}

function formatSearch(phrase) {
  return decodeURIComponent(phrase).replace(/ /g, '+');
}

function sendSearchMessage(phrase) {
  console.log(phrase);
  chrome.runtime.sendMessage({
    action: 'search',
    phrase: phrase,
    hostname: window.location.hostname,
    url: window.location.href
  });

  setTimeout(function() {
    if (phrase.match('date')) {
      var date = findDate(document.body.textContent);
      sendAlarmMessage(phrase, date);
    }
  }, 1000);
}

function sendAlarmMessage(phrase, date) {
  console.log(date);
  chrome.runtime.sendMessage({
    action: 'alarm',
    date: date,
    phrase: phrase
  });
}

/**
 * Finds the most likely date of an event in the provided text.
 */
function findDate(text) {
  var dates = {}, dateString, dateCount,
      match = text.match(dateRegex);

  if (!match) {
    return null;
  }

  match.forEach(function(text) {
    // Count the number of occurences of each date.
    dateString = new Date(text).toDateString();
    dateCount = dates[dateString];
    if (!dateCount) {
      dateCount = 0;
    }
    dates[dateString] = dateCount + 1;
  });

  // Get the date that occurred the most
  var max = 0,
      value = null;

  Object.keys(dates).forEach(function(date) {
    if (date != 'Invalid Date' && new Date(date) > Date.now() && dates[date] > max) {
      max = dates[date];
      value = date;
    }
  });

  return value;
}

var dateRegex = /(?:(?:January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sep|October|Oct|November|Nov|December|Dec)\s+\d{1,2},\s*\d{2,4}|\d{1,2}\/\d{1,2}\/(?:\d{4}|\d{2}))/g;
