var $container = $('.container');
var $backdrop = $('.backdrop');
var $highlights = $('.highlights');
var $clean = $('.clean');
var $warning = $('#warning-area');
var $textarea = $('textarea');
var $toggle = $('button');

// yeah, browser sniffing sucks, but there are browser-specific quirks to handle that are not a matter of feature detection
var ua = window.navigator.userAgent.toLowerCase();
var isIE = !!ua.match(/msie|trident\/7|edge/);
var isWinPhone = ua.indexOf('windows phone') !== -1;
var isIOS = !isWinPhone && !!ua.match(/ipad|iphone|ipod/);

function warningReset() {
    // Resets our warnings
    document.getElementById("warning-area").classList.remove("warning");
    $warning.html("&hearts;");
    $clean.html("With Love");
}

function repeatingWords(inputText) {
    // Working here
    // var inputText = $textarea.val();
    let dateRegexp = /-\s(?<first>\w+)|\;\s(?<second>\w+)|\-\-(?<third>\w+)/gi;
    let results = inputText.matchAll(dateRegexp);
    results = Array.from(results)
    verb = [];
    console.log("Result groups: " + results);
    for (i = 0; i < results.length; i++) {
        let action = results[i][1];
        if (typeof action !== "undefined") {
            console.log("Found the following verb: " + action.toLowerCase());
            verb.push(action.toLowerCase());
        }
        let result = results[i][2];
        if (typeof result !== "undefined") {
            console.log("Found the following verb: " + result.toLowerCase());
            verb.push(result.toLowerCase());
        }
        let impact = results[i][3];
        if (typeof impact !== "undefined") {
            console.log("Found the following verb: " + impact.toLowerCase());
            verb.push(impact.toLowerCase());
        }
    }

    console.log("Finished verb list: " + verb);
    return (verb);

}

function applyHighlights(text) {
    // This splits the text into an array, iterates through to check each item for length, and mark with span if over 114 characters and with object if shorter than 112.
    arrayLines = text.split('\n')
    console.log("Split into: " + arrayLines);
    for (i = 0; i < arrayLines.length; i++) {
        console.log(arrayLines[i]);
        var len = arrayLines[i].length;
        if (arrayLines[i] == '') {
            console.log("Found blank line")
        }
        else if (len > 115) {
            console.log(arrayLines[i] + " is too long, it is this many characters: " + arrayLines[i].length);
            text = text.replace(arrayLines[i], '<span>$&</span>');
        }
        else if (len < 112) {
            console.log(arrayLines[i] + " is too short, it is this many characters: " + arrayLines[i].length);
            text = text.replace(arrayLines[i], '<object>$&</object>');
        }
    }
    text = text
        .replace(/\n$/g, '\n\n')
        .replace(/[A-Z]{2,}/g, '<mark>$&</mark>');

    // Check for duplicate versb
    let dupeVerbs = repeatingWords(text);
    console.log("Array of verbs: " + dupeVerbs);
    for (n = 0; n < dupeVerbs.length; n++) {
        count = 0;
        const dupeRegex = new RegExp(dupeVerbs[n], 'gi');
        console.log("Searching for verb: " + dupeVerbs[n])
        while (dupeRegex.exec(text) !== null) {
            ++count;
        }
        if (count > 1) {
            console.log("Found duplicate verb: " + dupeVerbs[n])
            text = text.replace(dupeRegex, '<data>$&</data>');
        }
    }

    if (isIE) {
        // IE wraps whitespace differently in a div vs textarea, this fixes it
        text = text.replace(/ /g, ' <wbr>');
    }
    return text;
}

function checkUnicode() {
    var brokenText = $textarea.val();
    unicodeSpace = ["\u2000", "\u2001", "\u2002", "\u2003", "\u2004", "\u2005", "\u2006", "\u2007", "\u2008", "\u2009", "\u200A", "\u200B", "\u200C", "\u200D"];
    unicodeHyphen = ["\u2011", "\u2012", "\u2013", "\u2014", "\u2015"];

    unicodeCheck = false;
    for (n = 0; n < unicodeSpace.length; n++) {
        console.log("Checking for: " + unicodeSpace[n]);
        if (brokenText.search(unicodeSpace[n]) != -1) {
            console.log("Found the following unicode: " + unicodeSpace[n]);
            unicodeCheck = true;
        }
        else { }
    }
    for (n = 0; n < unicodeHyphen.length; n++) {
        console.log("Checking for: " + unicodeHyphen[n]);
        if (brokenText.search(unicodeHyphen[n]) != -1) {
            console.log("Found the following unicode: " + unicodeHyphen[n]);
            unicodeCheck = true;
        }
        else { }
    }
    if (unicodeCheck) {
        $warning.html("Your input contains unicode characters that are invalid for use.<br>I have attempted to remove the offending characters for you.<br>Please copy the bullets in yellow below and try again using the copied input.");
        document.getElementById("warning-area").classList.add("warning");
        cleanUnicode();
    }
}

function cleanUnicode() {
    var brokenText = $textarea.val();
    unicodeSpace = ["\u2000", "\u2001", "\u2002", "\u2003", "\u2004", "\u2005", "\u2006", "\u2007", "\u2008", "\u2009", "\u200A", "\u200B", "\u200C", "\u200D"];
    unicodeHyphen = ["\u2011", "\u2012", "\u2013", "\u2014", "\u2015"];
    for (n = 0; n < unicodeSpace.length; n++) {
        const regex = new RegExp(unicodeSpace[n], 'g');
        brokenText = brokenText.replace(regex, ' ');
    }
    for (n = 0; n < unicodeHyphen.length; n++) {
        const regex = new RegExp(unicodeHyphen[n], 'g');
        brokenText = brokenText.replace(regex, '-');
    }
    arrayLines = brokenText.split('\n');
    for (i = 0; i < arrayLines.length; i++) {
        brokenText = brokenText.replace(arrayLines[i], '<li>$&</li>');
    }
    $clean.html(brokenText);
}

function handleInput() {
    warningReset();
    checkUnicode();
    // repeatingWords();
    var text = $textarea.val();
    var highlightedText = applyHighlights(text);
    $highlights.html(highlightedText);
}

function handleScroll() {
    var scrollTop = $textarea.scrollTop();
    $backdrop.scrollTop(scrollTop);

    var scrollLeft = $textarea.scrollLeft();
    $backdrop.scrollLeft(scrollLeft);
}

function fixIOS() {
    // iOS adds 3px of (unremovable) padding to the left and right of a textarea, so adjust highlights div to match
    $highlights.css({
        'padding-left': '+=3px',
        'padding-right': '+=3px'
    });
}

function bindEvents() {
    $textarea.on({
        'input': handleInput,
        'scroll': handleScroll
    });
}

if (isIOS) {
    fixIOS();
}

bindEvents();
handleInput();

// Thesaurus implementation
let searchInput = document.querySelector("input");
let searchButton = document.querySelector("button");
let display = document.querySelector(".display ol");

let apiKey = "https://api.datamuse.com/words?ml=";

searchButton.addEventListener("click", (event) => {
  event.preventDefault();

  let endpoint = apiKey + searchInput.value;

  // clear previous session
  while (display.firstChild) {
    display.removeChild(display.firstChild);
    searchInput.value = "";
  }

  // handle response
  const xhr = new XMLHttpRequest();
  xhr.responseType = "json";
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      renderResponse(xhr.response);
    }
  };

  xhr.open("GET", endpoint);
  xhr.send();
});

let renderResponse = (res) => {
  if (!res) {
    console.log(res.status);
  }

  if (!res.length) {
    display.innerHTML = "No matching words found!";
    display.style.overflowY = "";
    return;
  }

  if (res.length >= 5) {
    display.style.overflowY = "scroll";
    display.style.height = "200px";
  }
  for (let foundWords of res) {
    display.innerHTML += `<li>${foundWords.word}</li>`;
  }
};