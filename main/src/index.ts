import { app, BrowserWindow, ipcMain, dialog } from "electron";
// import { ThreeMFLoader } from './3MFLoader';
import { STLLoader } from "./STLLoader";

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    // frame: false,
    transparent: false,
    webPreferences: {
      // <--- (1) Additional preferences
      nodeIntegration: true,
      preload: __dirname + "/preload.js", // <--- (2) Preload script
    },
  });

  win.loadURL("http://localhost:3000"); // <--- (3) Loading react

  // win.webContents.openDevTools();

  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on("window:minimize", function (e) {
  win.minimize();
});

ipcMain.on("window:maximize", function (e) {
  win.maximize();
});

ipcMain.on("window:close", function (e) {
  win.close();
});

// Catch file:open
ipcMain.on("file:open", function (e) {
  const selectedPaths = dialog.showOpenDialogSync({
    filters: [
      { name: "3D Files", extensions: ["3mf", "stl"] },
      { name: "3MF Files", extensions: ["3mf"] },
      { name: "STL Files", extensions: ["stl"] },
    ],
    properties: ["openFile", "multiSelections"],
  });

  if (selectedPaths) {
    handleFileSelection(selectedPaths);
  }
});

function handleFileSelection(filePaths: string[]) {
  filePaths.forEach((filePath) => {
    var fileExtension = filePath.split(".").pop();

    // if (fileExtension === '3mf') {

    //     var loader = new ThreeMFLoader();
    //     loader.load(filePath, function (build) {

    //  win.webContents.send("item:add", filePath, mesh);

    //     });

    // }
    // else
    if (fileExtension === "stl") {
      var stlLoader = new STLLoader();
      stlLoader.load(filePath, function (geometry) {
        win.webContents.send("item:add", filePath, geometry);
      });
    }
  });
}
