const fs = require('fs/promises');
const convert = require('./convert.js');
const music = require('./music.js');

const main = async function() {
    links = await fs.readFile('./links.txt', { encoding: 'utf8' });
    links = links.split("\n");
    allSlides = { "slides" : [] };
    
    for (var i = 0; i < links.length; i++) {
        type = links[i].substring(0, links[i].indexOf(" "));
        links[i] = links[i].substring(links[i].indexOf(" ")+1, links[i].length);

        console.log(`Getting lyrics for ${links[i]}...`);

        songSlides = await music.getLyrics(links[i], parseInt(type));
        allSlides.slides = allSlides.slides.concat(songSlides);
    }

    console.log("Finished scraping lyrics.");
    convert.saveFile(allSlides);

}

main();