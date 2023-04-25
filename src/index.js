const scrape = require('./scraper/scrape.js');
const create = require('./creator/convert.js');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

console.clear();

console.log("\nWorship Slides Generator\n\n")

readline.question('Ultimate Guitar Tabs URL:\n> ', async function (url) {
    await scrape(url);
    readline.question('Press ENTER when done editing:\n', async function (pass) {
        readline.question('Which template slide should be used?:\n> ', async function (num) {
            create(num);
            readline.close();
        });
    });
});

