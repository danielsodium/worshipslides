const axios = require('axios');
const fs = require('fs');

function remove(str, start, end) {
    return str.substr(0,start) + str.substr(end+1);
}

function clean(raw) {

    const startCut = '&quot;content&quot;:&quot;';
    const endCut   = "&quot;,&quot;revision_id&";

    // cut down page to managable size
    cut = raw.substring(raw.indexOf(startCut) + startCut.length, 
                        raw.indexOf(endCut));


    // remove all chords
    while (cut.indexOf("[ch]") != -1) {
        cut = remove(cut, cut.indexOf("[ch]"), cut.indexOf("[/ch]") + 4)
    }

    // remove all \r and \n
    while (cut.indexOf("\\") != -1) {
        cut = remove(cut, cut.indexOf("\\"), cut.indexOf("\\")+1)
    }

    lyrics = [];
    index = -1;

    infiniteCatch = 0;
    // If weird guitar ascii art exists delete it
    tag = cut.indexOf("[");
    if (cut.substring(tag+1, tag + 4) == "tab") {
        cut = cut.substring(cut.indexOf("]")+1, cut.length);
        cut = cut.substring(cut.indexOf("[/tab]")+6, cut.length);
    } 

    // Actual parsing
    while (cut.length > 1) {
        tag = cut.indexOf("[");
        if (cut.substring(tag+1, tag + 4) == "tab") {
            cut = cut.substring(cut.indexOf("]")+1, cut.length);
            lyrics[index].lines.push(cut.substring(0, cut.indexOf("[")).trim().replace("&rsquo;","'"));
            cut = cut.substring(cut.indexOf("]")+1, cut.length);
        } 
        else {
            title = cut.substring(cut.indexOf("[")+1, cut.indexOf("]"));
            cut = cut.substring(cut.indexOf("]")+1, cut.length);
            lyrics[++index] = { "title": title, "lines": [] };
        }

        infiniteCatch++;
        if (infiniteCatch > 1000) break;
    }

    // removing sections with no lyrics
    for (var i = 0; i < lyrics.length; i++) {
        if (lyrics[i].lines.length < 1) lyrics.splice(i, 1);
    }
    return (lyrics);
}

function format(cleaned) {
    titles = [];
    original = [];
    trimmed = [];

    // remove duplicates
    for (var i = 0; i < cleaned.length; i++) {
        text = cleaned[i].title;
        if (titles.indexOf(text) == -1) {
            titles.push(text);
            trimmed.push(cleaned[i]);
        }
        original.push(text);
    }


    lyrics = "";
    order = "INSERT SONG TITLE HERE\n\n";

    for (var i = 0; i < original.length; i++) {
        order += `${original[i].toUpperCase()}\n`;
    }
    for (var i = 0; i < trimmed.length; i++) {
        lyrics += `\n[${trimmed[i].title.toUpperCase()}]\n`;
        for (var j = 0; j < trimmed[i].lines.length; j++) {
            lyrics += `${trimmed[i].lines[j].toUpperCase()}\n`;
        }
    }

    fs.writeFileSync("./ORDER.txt", order);
    fs.writeFileSync("./REFERENCE.txt", lyrics);

    console.log("Generated ORDER.txt and REFERENCE.txt")

    return titles;
}


function scrape() {
    var config = {
        method: 'get',
        url: 'https://tabs.ultimate-guitar.com/tab/elevation-worship/same-god-chords-4041202',
    };

    axios(config)
        .then(function (response) {
            cleaned = clean(response.data);
            return format(cleaned);
        })
        .catch(function (error) {
            console.log(error);
        });
}

module.exports = scrape;