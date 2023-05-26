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
            // preload: path.join(__dirname, 'preload.js')
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