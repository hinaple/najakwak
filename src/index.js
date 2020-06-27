const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");

if (require("electron-squirrel-startup")) {
    app.quit();
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 200,
        height: 200,
        frame: false,
        icon: "wakdoo.ico",
        transparent: true,
        alwaysOnTop: true,
        fullScreenable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    
    mainWindow.setIgnoreMouseEvents(true);
    mainWindow.setSkipTaskbar(true);

    mainWindow.loadFile(path.join(__dirname, "index.html"));

    //mainWindow.removeMenu();
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
