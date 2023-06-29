const { app, BrowserWindow, dialog, ipcMain } = require('electron')

const fs = require('fs');
const path = require('path')
const uploader = require(path.join(__dirname, 'fileupload.js'));


const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('views/index.html')
}

// Upload handled by node not browser
ipcMain.handle('upload', async (event, jsoned, fpath) => {
    await uploader(jsoned,fpath);
    return;
})

// Error message dialog
ipcMain.handle('msg', async (event, title, msg) => {
    const options = {
        title: title,
        message: msg,
    };
    dialog.showMessageBox(null, options, () => {
    });
    return;
})

// Create settings file if not created
ipcMain.handle('create-data', async (event) => {
    var path = app.getPath('userData')+"/AppStorage"
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
        data = {cookies: ""};
        fs.appendFile(path+"/data.json", JSON.stringify(data), function (err) {``
            if (err) throw err;
            console.log('Saved!');
        });
    } else {
        
    }
})

ipcMain.handle('read-data', async (event) => {
    var path = app.getPath('userData')+"/AppStorage"
    if (fs.existsSync(path)){
        data = await fs.promises.readFile(`${path}/data.json`, 'utf8');
        data = JSON.parse(data);
        return data;
    }
})

// Writing settings
ipcMain.handle('write-data', async (event, data) => {
    data = {cookies: data};
    var path = app.getPath('userData')+"/AppStorage"
    if (fs.existsSync(path)){
        fs.writeFile(path+"/data.json", JSON.stringify(data), err => {
            console.log("Saved!")
        })
    }
})


app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    // Apple rlly is weird
    if (process.platform !== 'darwin') app.quit()
})