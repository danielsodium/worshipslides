const axios = require('axios');
const fs = require('fs');


// Copied from stackoverflow
function isNumber(str) {
    return /^\d+$/.test(str);
}

function remove(str, start, end) {
    return str.substr(0, start) + str.substr(end + 1);
}

function searchFields(array, field, target) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][field] == target) {
            return true;
        }
    }
    return false;

}

function clean(raw) {
    fs.writeFileSync('./raw.txt', raw);
   
    title = raw.substring(raw.indexOf("<title>"), raw.indexOf("by"));

    const startCut = '&quot;content&quot;:&quot;';
    const endCut = "&quot;,&quot;revision_id&";

    // cut down page to managable size
    cut = raw.substring(raw.indexOf(startCut) + startCut.length,
        raw.indexOf(endCut));


    // remove all chords
    while (cut.indexOf("[ch]") != -1) {
        cut = remove(cut, cut.indexOf("[ch]"), cut.indexOf("[/ch]") + 4)
    }

    // remove all \r and \n
    while (cut.indexOf("\\") != -1) {
        cut = remove(cut, cut.indexOf("\\"), cut.indexOf("\\") + 1)
    }

    lyrics = [];
    index = -1;
    infiniteCatch = 0;
    
    // If weird guitar ascii art exists delete it
    tag = cut.indexOf("[");
    if (cut.substring(tag + 1, tag + 4) == "tab") {
        cut = cut.substring(cut.indexOf("]") + 1, cut.length);
        cut = cut.substring(cut.indexOf("[/tab]") + 6, cut.length);
    }

    // Actual parsing
    while (cut.length > 1) {
        tag = cut.indexOf("[");
        if (cut.substring(tag + 1, tag + 4) == "tab") {
            cut = cut.substring(cut.indexOf("]") + 1, cut.length);

            lyrics[index].lines.push(cut.substring(0, cut.indexOf("[")).
                trim()
                .replaceAll("&rsquo;", "'")
                .replaceAll("&#039;", "'")
                .replaceAll("QUOT;", '"'));

            cut = cut.substring(cut.indexOf("]") + 1, cut.length);
        }
        else {
            title = cut.substring(cut.indexOf("[") + 1, cut.indexOf("]"));
            cut = cut.substring(cut.indexOf("]") + 1, cut.length);

            // Some songs have just "verse" for all the verses so we
            // need to number them


            if (!isNumber(title.slice(-1))) {
                var suffix = 1;
                while (searchFields(lyrics, "title", `${title} ${suffix}`)) suffix++;
                title = `${title} ${suffix}`;
            }


            if (title != "") lyrics[++index] = { "title": title, "lines": [] };
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

    for (var i = 0; i < cleaned.length; i++) {
        text = cleaned[i].title;
        titles.push(text);
        trimmed.push(cleaned[i]);
        original.push(text);
    }

    lyrics = "";
    order = "INSERT SONG TITLE HERE\n\n";

    for (var i = 0; i < original.length; i++) {
        order += `${original[i].toUpperCase()}\n`;
    }
    for (var i = 0; i < trimmed.length; i++) {
        lyrics += `\n\n[${trimmed[i].title.toUpperCase()}]\n`;
        
        var checked = 0;

        for (var j = 0; j < trimmed[i].lines.length; j++) {
            //if (lyrics != "") 
            if (j != 0) lyrics += '\n';
            lyrics += `${trimmed[i].lines[j].toUpperCase()}`;
            checked++;
            if (checked > 1) {
                checked = 0;
                lyrics += '\n';
            }
        }
    }

    return { order: order, lyrics: lyrics };
}


async function scrape(url, cookie) {
    
    var config = {
        method: 'get',
        url: url,
        headers: {
            'Cookie': cookie
        }
    };
    console.log(url)
    return new Promise((resolve, reject) => {
        axios(config)
            .then(function (response) {
                cleaned = clean(response.data);
                resolve(format(cleaned));
            })
            .catch(function (error) {
                console.log(error);
            });
    })
}

module.exports = scrape;