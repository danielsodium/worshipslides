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
    data = {
        title: select('//h1', doc)[0].lastChild.data,
        artist: select('//h2', doc)[0].firstChild.firstChild.firstChild.data,
        lyrics: ""
    }

    for(let j = 0; j < nodes.length; j++) {
        if(typeof nodes[j].firstChild !== 'undefined' && typeof nodes[j].firstChild.data !== 'undefined') {
            data.lyrics += (nodes[j].firstChild.data);
        }
    }

    return data;
}


const getLyrics = async function(query, type, capitalize) {
    var a = await fetchURLs(query);
    var data = await fetchLyrics(a);
    listed = data.lyrics;
    listed = listed.split("\n");
    listed = listed.filter(item => item);
    listed.unshift(data.title+"\n"+data.artist);

    if (capitalize) type.substring(0,type.length-1);
    type = parseInt(type);

    total = [];

    // Adding multiple lyrics on one line if they are short
    for (var i = 0; i < listed.length; i++) {

        line = capitalize ? listed[i].toUpperCase().replace(",", "\n").trim() 
                          : listed[i].replace(",", "\n").trim();
        nextLine = capitalize ? listed[i+1].toUpperCase().replace(",", "\n").trim() 
                              : listed[i+1].replace(",", "\n").trim();

        if (i != 0 && i+1 < listed.length && listed[i+1].length < 30 && listed[i].length < 30) {
            total.push({ "$slide" : type, "lyrics": line + "\n"+ nextLine });
            i++;
        }
        else {
            total.push({"$slide":type,"lyrics":line});
        }
    }
    return total;
}

module.exports = { getLyrics }

