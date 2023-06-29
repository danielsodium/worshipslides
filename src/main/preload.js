const fs = require('fs');
const electron = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.invoke('create-data')
})