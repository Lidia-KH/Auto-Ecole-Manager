const { isAppLicensed } = require("./licenseService");
const { app, BrowserWindow } = require("electron");
const path = require("path");

require("./handlers");

const { createBackup } = require("./backup");

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../renderer/dist/index.html"));
  }
}

app.whenReady().then(() => {
  createBackup();
  createWindow();
});


app.on("before-quit", () => {
  createBackup();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0)
    createWindow();
});