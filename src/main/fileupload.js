const axios = require('axios');
const fs = require('fs')
var FormData = require('form-data');
const path = require('path')

async function uploader(jsoned, path) {
    var formdat = new FormData();

    formdat.append('data', JSON.stringify(jsoned));
    formdat.append('doc', fs.createReadStream(path), { contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    formdat.append('style.css', "/**/", { contentType: 'text/plain' });

    var config = {
        method: 'post',
        url: 'https://docxapi.javascript-ninja.fr/api/v1/generate?extension=pptx&silent=true&imagesize=100x100&delimiters={+}&subrender=false&subtemplateSubsections=false',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formdat
    };

    return new Promise((resolve, reject) => {
        axios(config)
            .then(async function (response) {
                await downloadFile('https://docxapi.javascript-ninja.fr/api/v1/last',
                    `./slides/${jsoned.slides[0].lyrics.replaceAll(" ", "_").toLowerCase()}.pptx`);

                resolve();
            })
            .catch(function (error) {
                reject(error);
            });
    })
}

async function downloadFile(fileUrl, outputLocationPath) {
    const writer = fs.createWriteStream(outputLocationPath);
    return new Promise((resolve, reject) => {
        axios({
            method: 'get',
            url: fileUrl,
            responseType: 'stream',
        }).then(response => {

            // ensure that the user can call `then()` only when the file has
            // been downloaded entirely.

            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve();
                }
            });
        });
    });
}

module.exports = uploader;