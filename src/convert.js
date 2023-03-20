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

    //ensure that the user can call `then()` only when the file has
    //been downloaded entirely.

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
          resolve(true);
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
}

function saveFile(jsoned) {
  var data = new FormData();
  data.append('data', JSON.stringify(jsoned));
  data.append('doc', fs.createReadStream('./../template.pptx'), { contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  data.append('style.css', "/**/", { contentType: 'text/plain' });

  var config = {
    method: 'post',
    url: 'https://docxapi.javascript-ninja.fr/api/v1/generate?extension=pptx&silent=true&imagesize=100x100&delimiters={+}&subrender=false&subtemplateSubsections=false',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      downloadFile('https://docxapi.javascript-ninja.fr/api/v1/last', "./../output.pptx");
      console.log("done!");
    })
    .catch(function (error) {
      console.log(error);
    });
}

module.exports = {
  saveFile
}