var axios = require('axios');
//var FormData = require('form-data');
const fs = require('fs');
const ipcRenderer = require('electron').ipcRenderer;

const { Readable } = require('stream');

async function saveFile(jsoned, fpath) {
    return new Promise(resolve => {
        ipcRenderer.invoke('upload', jsoned, fpath).then(() => {
            console.log("resolved")
            resolve();
        });
    })
}

async function convert(num, order, ref, file) {
    return new Promise(async resolve => {
        num = parseInt(num);
        //order = fs.readFileSync("./ORDER.txt", 'utf8');
        //ref = fs.readFileSync("./REFERENCE.txt", 'utf8');
        order = order.split("\n");
        ref = ref.split("\n");

        table = {};
        lastTitle = "";
        slideIndex = 0;

        // Creating object from ref
        for (var i = 0; i < ref.length; i++) {
            line = ref[i];
            if (line == "\n" || line == "") {
                if (lastTitle != "" && i != ref.length-1 && ref[i+1][0] != '[') {
                    table[lastTitle].push({"$slide":num,"lyrics":""});
                    slideIndex++;
                }
            } else if (line[0] == '[') {
                lastTitle = line.substring(1, line.length-1);
                table[lastTitle] = [{"$slide":num,"lyrics":""}];
                slideIndex = 0;
            } else {

                if (table[lastTitle][slideIndex].lyrics != "") 
                    table[lastTitle][slideIndex].lyrics += "\n"
                table[lastTitle][slideIndex].lyrics += `${line}`;
            }
        }


        // Now we create the entire json
        jsoned = [];

        // Title
        jsoned = jsoned.concat({"$slide":num,"lyrics":order[0]});

        for (var i = 1; i < order.length; i++) {
            if (order[i] == "") continue;
            jsoned = jsoned.concat(table[order[i]]);
        }
    
        await saveFile({"slides": jsoned}, file);
        resolve();
    });
    
}


module.exports = convert;