const { app, BrowserWindow } = require("electron");


const path = require("path");

require("./handlers");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
        preload: path.join(__dirname, "../preload/preload.js")
    },
  });

  win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);