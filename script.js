var $container = $('.container');
var $backdrop = $('.backdrop');
var $highlights = $('.highlights');
var $clean = $('.clean');
var $warning = $('#warning-area');
var $textarea = $('textarea');
var $toggle = $('button');
var $abbrsarea = $('.abbrsarea');

var acronymArray = [];

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
    let dateRegexp = /-\s(?<first>\w+)|\;\s(?<second>\w+)|\-\-(?<third>\w+)/gi;
    let results = inputText.matchAll(dateRegexp);
    results = Array.from(results)
    verb = [];
    // console.log("Result groups: " + results);
    for (i = 0; i < results.length; i++) {
        let action = results[i][1];
        if (typeof action !== "undefined") {
            // console.log("Found the following verb: " + action.toLowerCase());
            verb.push(action.toLowerCase());
        }
        let result = results[i][2];
        if (typeof result !== "undefined") {
            // console.log("Found the following verb: " + result.toLowerCase());
            verb.push(result.toLowerCase());
        }
        let impact = results[i][3];
        if (typeof impact !== "undefined") {
            // console.log("Found the following verb: " + impact.toLowerCase());
            verb.push(impact.toLowerCase());
        }
    }

    // console.log("Finished verb list: " + verb);
    return (verb);

}

function applyHighlights(text) {
    // This splits the text into an array, iterates through to check each item for length, and mark with span if over 114 characters and with object if shorter than 112.
    arrayLines = text.split('\n')
    // console.log("Split into: " + arrayLines);
    for (i = 0; i < arrayLines.length; i++) {
        // let's get the settings from the user
        var minWidthEl = document.getElementById('minimum').value;
        // console.log("The minimum width value is: " + minWidthEl);
        var maxWidthEl = document.getElementById('maximum').value;
        // console.log("The maximum width value is: " + maxWidthEl);
        // console.log(arrayLines[i]);
        var len = arrayLines[i].length;
        if (arrayLines[i] == '') {
            // console.log("Found blank line")
        }
        else if (len > 115) {
            // console.log(arrayLines[i] + " is too long, it is this many characters: " + arrayLines[i].length);
            text = text.replace(arrayLines[i], '<span>$&</span>');
        }
        else if (len < 112) {
            // console.log(arrayLines[i] + " is too short, it is this many characters: " + arrayLines[i].length);
            text = text.replace(arrayLines[i], '<object>$&</object>');
        }
    }
    text = text
        .replace(/\n$/g, '\n\n')
        .replace(/[A-Z]{2,}/g, '<mark>$&</mark>');

    // Check for duplicate versb
    let dupeVerbs = repeatingWords(text);
    // console.log("Array of verbs: " + dupeVerbs);
    for (n = 0; n < dupeVerbs.length; n++) {
        count = 0;
        const dupeRegex = new RegExp(dupeVerbs[n], 'gi');
        // console.log("Searching for verb: " + dupeVerbs[n])
        while (dupeRegex.exec(text) !== null) {
            ++count;
        }
        if (count > 1) {
            // console.log("Found duplicate verb: " + dupeVerbs[n])
            text = text.replace(dupeRegex, '<data>$&</data>');
        }
    }

    if (isIE) {
        // IE wraps whitespace differently in a div vs textarea, this fixes it
        text = text.replace(/ /g, ' <wbr>');
    }
    return text;
}

function acronymExtract() {
    // reset our acronym array
    acronymArray = [];
    // add our identified acronyms to our array
    var inputText = $textarea.val();

    acronymList = inputText.matchAll(/[A-Z]{2,}/g);
    acronymArray = Array.from(acronymList).sort();
    acronymArray = acronymArray.map(JSON.stringify).filter((e, i, a) => i === a.indexOf(e)).map(JSON.parse);
    var acronymReturnArea = document.getElementById('acronyms');
    acronymReturnArea.innerHTML = "Acronyms: ";
    for (i = 0; i < acronymArray.length; i++) {
        // console.log(acronymArray[i][0]);
        let foundAcronym = acronymArray[i][0];
        acronymReturnArea.innerHTML += "(" + foundAcronym + "); ";
    };
}

function checkUnicode() {
    var brokenText = $textarea.val();
    unicodeSpace = ["\u2000", "\u2001", "\u2002", "\u2003", "\u2004", "\u2005", "\u2006", "\u2007", "\u2008", "\u2009", "\u200A", "\u200B", "\u200C", "\u200D"];
    unicodeHyphen = ["\u2011", "\u2012", "\u2013", "\u2014", "\u2015"];

    unicodeCheck = false;
    for (n = 0; n < unicodeSpace.length; n++) {
        // console.log("Checking for: " + unicodeSpace[n]);
        if (brokenText.search(unicodeSpace[n]) != -1) {
            // console.log("Found the following unicode: " + unicodeSpace[n]);
            unicodeCheck = true;
        }
        else { }
    }
    for (n = 0; n < unicodeHyphen.length; n++) {
        // console.log("Checking for: " + unicodeHyphen[n]);
        if (brokenText.search(unicodeHyphen[n]) != -1) {
            // console.log("Found the following unicode: " + unicodeHyphen[n]);
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
    text = runAbbrs(text);
    var highlightedText = applyHighlights(text);
    $highlights.html(highlightedText);
    acronymExtract();
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


// Abbreviations

var abbrs = [];

function toggleAbbrs() {
    var button = document.getElementById('abbreviations');
    if (button.value == "enabled") {
        button.value = "disabled";
        button.style.backgroundColor = "tomato";
        return;
    };
    if (button.value == "disabled") {
        button.value = "enabled";
        button.style.backgroundColor = "green";
        handleInput();
    };
}

function runAbbrs(text) {
    var button = document.getElementById('abbreviations');
    if (button.value == "disabled") {
        return text;
    }
    else {
        // do all the swaps
        for (let key in abbrs) {
            var abbrsKey = abbrs[key]['long'];
            var abbrsRegex = new RegExp(abbrsKey, 'g');
            var abbrsReplacement = abbrs[key]['short'];
            // need to do data validation because copy/paste introduces newlines
            if (abbrsKey !== "" && abbrsReplacement !== "undefined") {
                // console.log(abbrsRegex);
                // console.log(abbrsReplacement);
                // let's replace the text with the abbreviation in the textarea
                var textarea = document.getElementById("data");
                const indexPairs = [];
                while (null !== (matchArr = abbrsRegex.exec(text))) {
                    indexPairs.push([matchArr.index, abbrsRegex.lastIndex]);
                }
                // console.log(indexPairs);
                for (i = 0; i < indexPairs.length; i++) {
                    var start = indexPairs[i][0];
                    var end = indexPairs[i][1];
                    var selectedText = textarea.value.slice(start, end);
                    var before = textarea.value.slice(0, start);
                    var after = textarea.value.slice(end);

                    var text = before + abbrsReplacement + after;
                    textarea.value = text;
                }
                // let's replace the text with the abbreviation in the highlighting
                text = text.replace(abbrsRegex, abbrsReplacement);
            }
        }
        return text;
    }
}

// grab text from abbrsarea textarea and create them into an array we can use
// array gets blanked at the beginning and saved as abbrs
function editAbbrs() {
    // console.log("Starting editAbbrs loop");
    var abbrSelect = document.getElementById('abbrs-select').value;
    // console.log("abbrs-select: " + abbrSelect);
    var inputText;
    if (abbrSelect == "custom") {
        inputText = $abbrsarea.val();
        processAbbrs(inputText);
        return
    }
    else {
        var abbrSelect = document.getElementById('abbrs-select').value;
        var abbrsPath = 'abbrs/' + abbrSelect;
        var abbrSelect = document.getElementById('abbrs-select').value;
        var xmlhttp;
        var inputText;
        if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else { // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                inputText = xmlhttp.responseText;
                // console.log(inputText);
                processAbbrs(inputText);
                return
            }
        }
        xmlhttp.open("GET", abbrsPath, true);
        xmlhttp.send();
    }
    // console.log("Input text: " + inputText);
}

function processAbbrs(inputText) {
    var objects = [];
    //split into rows
    var rows = inputText.split('\n');

    //Make column
    columns = ['long', 'short'];
    // console.log(columns);

    for (var rowNr = 0; rowNr < rows.length; rowNr++) {
        var o = {};
        var data = rows[rowNr].split('\t');
        for (var cellNr = 0; cellNr < data.length; cellNr++) {
            o[columns[cellNr]] = data[cellNr];
        }

        objects.push(o);
    }
    // console.log(objects);
    abbrs = objects;
}


// Grab right click from mouse
oncontextmenu = (e) => {
    // don't run if ctrl key is pushed as well
    if (e.ctrlKey) {
        return;
    }
    else {
        e.preventDefault();
        var menu = document.createElement("div");
        menu.id = "contextMenu";
        menu.style = `top:${e.pageY - 10}px;left:${e.pageX - 40}px`;
        document.body.appendChild(menu);
        menu.onmouseleave = () => contextMenu.outerHTML = '';
        menu.onclick = () => contextMenu.outerHTML = '';
        // Let's grab what text we have selected
        var selectedText = selecttext(e);
        // Now let's get the list of synonyms from Datamuse
        var searchResults = thesaurussearch(selectedText);
    }
}

function selecttext() {
    var textarea = document.getElementById("data");
    var selection = (textarea.value).substring(textarea.selectionStart, textarea.selectionEnd);
    return selection;
}

function replaceText(replacement) {
    var textarea = document.getElementById("data");

    // let's see if this works?
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;

    var selectedText = textarea.value.slice(start, end);
    var before = textarea.value.slice(0, start);
    var after = textarea.value.slice(end);

    var text = before + replacement + after;
    textarea.value = text;
    handleInput();
}

// Thesaurus implementation
let apiKey = "https://api.datamuse.com/words?ml=";

function thesaurussearch(query) {
    // let's search for our input word
    let endpoint = apiKey + query;

    // handle response
    const xhr = new XMLHttpRequest();
    var finalResults = [];
    xhr.responseType = "json";
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            renderResponse(xhr.response);
        }
    };

    xhr.open("GET", endpoint);
    xhr.send();
};

let renderResponse = (res) => {
    var menu = document.getElementById('contextMenu');

    if (!res) {
        // console.log(res.status);
        thesarusWords = ['An error occured']
    }

    if (!res.length) {
        menu.innerHTML = "No matching words found!";
        menu.style.overflowY = "";
        return;
    }

    if (res.length >= 5) {
        menu.style.overflowY = "scroll";
        menu.style.height = "200px";
    }

    for (let foundWords of res) {
        menu.innerHTML += `<p onclick="replaceText('${foundWords.word}')">${foundWords.word}</p>`;
    }
    return;
};

// Dark mode
function darkMode() {
    var element = document.body;
    element.classList.toggle("dark");
    var bulletArea = document.getElementById('data');
    bulletArea.classList.toggle("dark");
    var abbrsArea = document.getElementById('abbrsarea');
    abbrsArea.classList.toggle("dark");
    var inputArea = document.getElementsByClassName('.input');
    inputArea.classList.toggle("dark");
    var imageArea = document.getElementsByClassName('.image');
    imageArea.classList.toggle("dark");
  }