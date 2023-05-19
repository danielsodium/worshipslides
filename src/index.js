const scrape = require('./scraper/scrape.js');
const create = require('./creator/convert.js');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

console.clear();

console.log("\nWorship Slides Generator\n\n")

readline.question('What parts would you like to do?\n1. Scrape\n2. Generate pptx\n3. Both\n\n> ', async function (choice) {
    switch (parseInt(choice)) {
        case 1:
            readline.question('Ultimate Guitar Tabs URL:\n> ', async function (url) {
                await scrape(url);
                readline.close();
            });
            break;            
        case 2:
            readline.question('Which template slide should be used?:\n> ', async function (num) {
                create(num);
                readline.close();
            });
            break;            
        case 3:
            readline.question('Ultimate Guitar Tabs URL:\n> ', async function (url) {
                await scrape(url);
                readline.question('Press ENTER when done editing:\n', async function (pass) {
                    readline.question('Which template slide should be used?:\n> ', async function (num) {
                        create(num);
                        readline.close();
                    });
                });
            });
            break;            
        default:
            console.log("Not a valid choice.\n");
            readline.close();
            return;
    }
                
})

