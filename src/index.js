const { app, BrowserWindow, Tray, Menu, ipcMain } = require("electron");
const path = require("path");

if (require("electron-squirrel-startup")) {
    app.quit();
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 100,
        height: 200,
        title: "우왁굳",
        frame: false,
        icon: path.join(__dirname, "wakdoo.ico"),
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        skipTaskbar: true,
        hasShadow: false,
        maximizable: false,
        resizable: false,
        fullscreenable: false
    });
    
    mainWindow.setIgnoreMouseEvents(true);

    mainWindow.loadFile(path.join(__dirname, "index.html"));
    mainWindow.removeMenu();

    ipcMain.on("getwakid", (event) => {
        event.returnValue = mainWindow.webContents.id;
    });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});