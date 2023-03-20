const { join } = require('path');
const { readFileSync } = require('fs');
var axios = require('axios');

const { select } = require('xpath');
const { DOMParser } = require('xmldom');

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
    lyrics = "";

    var title = select('//h1', doc)[0].lastChild.data; 
    lyrics+=(title+"\n");

    for(let j = 0; j < nodes.length; j++) {
        if(typeof nodes[j].firstChild !== 'undefined' && typeof nodes[j].firstChild.data !== 'undefined') {
            lyrics += (nodes[j].firstChild.data);
        }
    }

    return lyrics;
}


const getLyrics = async function(query, type) {
    var a = await fetchURLs(query);
    var listed = await fetchLyrics(a);
    listed = listed.split("\n");
    listed = listed.filter(item => item);
    total = [];

    // Adding multiple lyrics on one line if they are short
    for (var i = 0; i < listed.length; i++) {
        if (i+1 < listed.length && listed[i+1].length < 30 && listed[i].length < 30) {
            total.push({"$slide":type, "lyrics":listed[i].toUpperCase().replace(",", "\n").trim()
                        + ("\n"+listed[i+1].toUpperCase().replace(",", "\n").trim())});
            i++;
        }
        else {
            total.push({"$slide":type,"lyrics":listed[i].toUpperCase().replace(",", "\n").trim()});
        }
    }
    return total;
}

module.exports = { getLyrics }

