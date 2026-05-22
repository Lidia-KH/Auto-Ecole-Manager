const { app, BrowserWindow } = require("electron");

const path = require("path");

require("./handlers");

console.log("== MAIN PROCESS STARTED");
console.log(
  "PRELOAD PATH:",
  path.resolve(__dirname, "../preload/preload.js")
);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
        preload: path.resolve(__dirname, "../preload/preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
    },
  });

  win.loadURL("http://localhost:5173");
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);