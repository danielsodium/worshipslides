const { join } = require('path');
const { readFileSync } = require('fs');
var axios = require('axios');

const { select } = require('xpath');
const { DOMParser } = require('xmldom');
const fs = require('fs');

const SEARCH_URL = 'https://www.musixmatch.com/search/';

/**
 * Copied from the 4lyric npm package, changed only
 * to include adding the title of the song
 */


/**
 * Fetches a list of song lyric URLs based on the query.
 * @param {string} query
 * @returns {string[]} URL list
 */
async function fetchURLs(q) {
    return new Promise((resolve, reject) => {
        try {
            var config = {
                method: 'get',
                url: SEARCH_URL + encodeURIComponent(q)
            };
            axios(config)
            .then(function (response) {
                resolve(parseURLs(response.data));
            })
            .catch(function (error) {
                console.log(error);
            });

            
        } catch(err) {
            throw err;
        }
    })
}

/**
 * Parses the HTML fetched previously, returning an array of URLs.
 * @param {string} html
 * @returns Array of URLs
 */
function parseURLs(t) {
    const doc = new DOMParser({ errorHandler: {warning:()=>{}, error:()=>{}} }).parseFromString(t);
    const nodes = select('//a[@class="title"]', doc);        
    const list = [];

    // go through each node and each attribute
    for(let j = 0; j < nodes.length; j++) {
        for(let i = 0; i < nodes[j].attributes.length; i++) {
            if(nodes[j].attributes[i.toString()].nodeName === 'href') { // keys are stored as strings
                //list.push('https://musixmatch.com' + nodes[j].attributes[i.toString()].value);
                //break;
                return ('https://musixmatch.com' + nodes[j].attributes[i.toString()].value);
            }
        }
    }

    return list;
}

/**
 * Fetch lyrics from specified URL
 * @param {string} url 
 */
async function fetchLyrics(url) {
    if(typeof url !== 'string') throw new Error('URL must be of type string');
    if(!/https?:\/\/(www.)?musixmatch.com\/lyrics\//.test(url)) throw new Error('Invalid URL ' + url);
    return new Promise((resolve, reject) => {
        var config = {
            method: 'get',
            url: url
        };
        axios(config)
        .then(function (response) {
            resolve(parseLyrics(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });
    })


}

/**
 * Parse the page's HTML and return the lyrics.
 * @param {string} html 
 * @returns {Array<string>} Array of lyric blocks
 */
function parseLyrics(t) {
    const doc = new DOMParser({ errorHandler: {warning:()=>{}, error:()=>{}} }).parseFromString(t);
    const nodes = select('//span[@class="lyrics__content__ok"]', doc);        
    data = {
        title: select('//h1', doc)[0].lastChild.data,
        artist: select('//h2', doc)[0].firstChild.firstChild.firstChild.data,
        lyrics: ""
    }

    for(let j = 0; j < nodes.length; j++) {
        if(typeof nodes[j].firstChild !== 'undefined' && typeof nodes[j].firstChild.data !== 'undefined') {
            data.lyrics += (nodes[j].firstChild.data+"\n");
        }
    }

    return data;
}
function clearParenthesis(listed) {
    for (var i = 0; i < listed.length; i++) {
        if (listed[i].charAt(0) == '(' && listed[i].charAt(listed[i].length-1) == ')') {
            listed.splice(i,1);
            i--;
        }
        else {
            listed[i] = listed[i].replace(/ *\([^)]*\) */g, "");
        }
    }
    return listed;
}

function arrToString(data) {
    var lyrics = "";
    for (var i = 0; i < data.length; i++) {
        lyrics += data[i];
        if (i != data.length-1) lyrics += "\n";
    }
    return lyrics;
}

const getLyrics = async function(query, type, capitalize) {
    var a = await fetchURLs(query);
    var data = await fetchLyrics(a);

    listed = data.lyrics.split("\n");
    listed = clearParenthesis(listed);

    if (capitalize) type.substring(0,type.length-1);
    type = parseInt(type);

    total = [];
    
    for (var i = 0; i < listed.length; i++) {
        // Number of lines per verse
        lines = 0;
        max = true;
        verse = [];
        for (var j = i; j < listed.length; j++) {
            if (listed[j] == "") {
                // Ended Verse
                if (lines != 0) {
                    if (lines%3 == 0) {
                        for (var k = 0; k < lines/3; k++) {
                            total.push({"$slide":type,"lyrics":arrToString(verse.slice(k*3, (k+1)*3))});
                        }
                    }
                    else if (lines%4 == 0) {
                        if (max) {
                            for (var k = 0; k < lines/4; k++) {
                                total.push({"$slide":type,"lyrics":arrToString(verse.slice(k*4, (k+1)*4))});
                            }
                        } else {
                            for (var k = 0; k < lines/2; k++) {
                                total.push({"$slide":type,"lyrics":arrToString(verse.slice(k*2, (k+1)*2))});
                            }
                        }
                    }
                    // If not divisble just split into lines of 3
                    else {
                        if (lines < 3) total.push({"$slide":type,"lyrics":arrToString(verse)});
                        else {
                            var k;
                            for (k = 0; k < lines/3; k++) { 
                                total.push({"$slide":type,"lyrics":arrToString(verse.slice(k*3, (k+1)*3+1))});
                            }
                            total.push({"$slide":type,"lyrics":arrToString(verse.slice(k*3, lines))});
                        }
                    }
                    i = j;
                }
                break;
            } else {
                lines++;
                if (listed[j].length >= 30) max = false;
                if (capitalize) verse.push(listed[j].toUpperCase());
                else verse.push(listed[j]);
            }
        }
    }
    if (capitalize) total.unshift({"$slide":type,"lyrics":data.title.toUpperCase()});
    else total.unshift({"$slide":type,"lyrics":data.title});
    return total;
}

module.exports = { getLyrics }

