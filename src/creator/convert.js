var axios = require('axios');
var FormData = require('form-data');
const fs = require('fs');

async function downloadFile(fileUrl, outputLocationPath) {
    const writer = fs.createWriteStream(outputLocationPath);

    return axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    }).then(response => {

        // ensure that the user can call `then()` only when the file has
        // been downloaded entirely.

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    console.log("Process finished.");
                    resolve(true);
                }
            });
        });
    });
}

function saveFile(jsoned) {
    var data = new FormData();
    data.append('data', JSON.stringify(jsoned));
    data.append('doc', fs.createReadStream('./template.pptx'), { contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    data.append('style.css', "/**/", { contentType: 'text/plain' });

    var config = {
        method: 'post',
        url: 'https://docxapi.javascript-ninja.fr/api/v1/generate?extension=pptx&silent=true&imagesize=100x100&delimiters={+}&subrender=false&subtemplateSubsections=false',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: data
    };

    console.log("Sending template and lyrics to server...");

    axios(config)
        .then(function (response) {
            console.log("Downloading file...");
            downloadFile('https://docxapi.javascript-ninja.fr/api/v1/last', "./output.pptx");
        })
        .catch(function (error) {
            console.log(error);
        });
}

function convert(num) {
    order = fs.readFileSync("./ORDER.txt", 'utf8');
    ref = fs.readFileSync("./REFERENCE.txt", 'utf8');
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
            table[lastTitle][slideIndex].lyrics += `${line}\n`;
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

    saveFile({"slides": jsoned});
}


module.exports = convert;