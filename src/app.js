const { remote, ipcRenderer } = require("electron");
const { app, BrowserWindow, Tray, Menu, getCurrentWindow, screen } = remote;
const path = require("path");
const fs = require("fs");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

let SCREEN_WIDTH = 0;
screen.getAllDisplays().find(display => {
    SCREEN_WIDTH += Number(display.workAreaSize.width);
});

const WINDOW_WIDTH = 100;
const WINDOW_HEIGHT = 200;

const CHAR_WIDTH = 72;
const CHAR_HEIGHT = 180;

const userData = app.getPath("userData").replace(/\\/g, "/");

const win = getCurrentWindow();

function showMsg(title, content) {
    tray.displayBalloon({
        icon: path.join(__dirname, "wakdoo.ico"),
        title: title,
        content: content,
        nosound: true
    });
}

let settings = null;
const settingList = [ "maxstep", "opacity", "endless", "startx", "starty", "shwmesi", "onshadow", "speed" ];
const settingTemplate = {
    maxstep: 2,
    opacity: 100,
    endless: true,
    startx: screen.getPrimaryDisplay().workAreaSize.width / 2 - (WINDOW_WIDTH / 2),
    starty: screen.getPrimaryDisplay().workAreaSize.height / 2 - (WINDOW_HEIGHT / 2),
    shwmesi: true,
    onshadow: true,
    speed: 1
};
try {
    settings = JSON.parse(fs.readFileSync(userData + "/setting.json", "utf-8"));
    let keys = Object.keys(settings);
    for(let i = 0; i < settingList.length; i++) {
        if(keys.length != settingList.length || keys[i] != settingList[i]) {
            settings = settingTemplate;
            fs.writeFileSync(userData + "/setting.json", JSON.stringify(settings), "utf-8");
            break;
        }
    }
}
catch(err) {
    settings = settingTemplate;
    fs.writeFileSync(userData + "/setting.json", JSON.stringify(settings), 'utf-8');
}

if(settings.onshadow) {
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 7;
}

tray = new Tray(path.join(__dirname, "wakdoo.ico"));

let settingWin = null;
let messiWin = null;
const contextMenu = Menu.buildFromTemplate([
    {
        label: "설정",
        click: () => {
            if(settingWin != null) {
                settingWin.focus();
                return;
            }
            settingWin = new BrowserWindow({
                parent: win,
                icon: path.join(__dirname, "wakdoo.ico"),
                width: 300,
                height: 430,
                resizable: false,
                maximizable: false,
                fullscreenable: false,
                minimizable: false,
                webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true
                }
            });
            settingWin.removeMenu();
            settingWin.loadFile("src/setting.html");

            settingWin.on("close", () => {
                settingWin = null;
            });
        }
    },
    {
        label: "옮기기 모드",
        type: "checkbox",
        checked: false,
        click: () => {
            win.setAlwaysOnTop(true);
            movable = !movable;
            win.setIgnoreMouseEvents(!movable);
            showMsg(
                "오영택님에게서 온 메시지",
                movable?
                "이제부터 저를 드래그해서 옮길 수 있어요~ 방해 안되게 가만히 있을게요~":
                "어~ 다 옮겼어? 이제 빨빨대도 되지?"
            );
        }
    },
    { type: "separator" },
    {
        label: "종료",
        click: () => {
            app.quit();
        }
    }
]);

tray.setToolTip("나만의 작은 왁굳");
tray.setContextMenu(contextMenu);

showMsg("오영택님에게서 온 메시지", "왁하~ 오른쪽 아래에 제 얼굴 우클릭하면 옵션 나와요~ 킹아!");

let imgs = {
    default: [],
    walk: []
};

const imgcnt = {
    default: 2,
    walk: 4
};
let time = 0;
let walking = [0, true];
let movable = false;
let farfromhome = 0;

for(name in imgs) {
    for(let i = 0; i < 2; i++) {
        imgs[name].push([]);
        for(let j = 0; j < imgcnt[name]; j++) {
            imgs[name][i].push(new Image());
            imgs[name][i][j].src = "../imgs/" + name + (i == 0? '': 'r') + j + ".png";
        }
    }
}

ctx.globalAlpha = settings.opacity / 100;
win.setPosition(settings.startx, settings.starty);
if(settings.shwmesi) {
    messiWin = new BrowserWindow({
        parent: win,
        width: 120,
        height: 100,
        title: "메시",
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

    messiWin.setIgnoreMouseEvents(true);

    messiWin.loadFile(path.join(__dirname, "messi.html"));
    messiWin.removeMenu();

    ipcRenderer.on("settings", () => {
        ipcRenderer.sendTo(messiWin.webContents.id, "settings", settings);
    });
}

setInterval(() => {
    ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    time++;
    if(time >= 60) time = 0;

    let winpos = win.getPosition();
    
    let tempImg = null;
    if(!walking[1]) tempImg = imgs.default[walking[0]][Math.floor(time / 30) % 2];
    else {
        win.setPosition(winpos[0] + ((walking[0] == 0? settings.speed: -settings.speed)), winpos[1]);
        if(settings.endless) {
            if(winpos[0] + WINDOW_WIDTH < 0) win.setPosition(SCREEN_WIDTH, winpos[1]);
            else if(winpos[0] > SCREEN_WIDTH) win.setPosition(-WINDOW_WIDTH, winpos[1]);
        }
        tempImg = imgs.walk[walking[0]][Math.floor(time / 15) % 4];
    }
    
    ctx.drawImage(tempImg, (WINDOW_WIDTH - CHAR_WIDTH) / 2, WINDOW_HEIGHT - CHAR_HEIGHT, CHAR_WIDTH, CHAR_HEIGHT);
}, 15);

setInterval(() => {
    if(!win.isAlwaysOnTop()) mainWindow.setAlwaysOnTop(true);
    tempwalking = Math.floor(Math.random() * 5);
    if(movable) {
        walking[1] = false;
        tempwalking = 1;
    }
    else if(tempwalking == 0) {
        farfromhome--;
        if(Math.abs(farfromhome) > settings.maxstep) {
            farfromhome++;
            walking[1] = false;
        }
        else {
            walking[0] = 0;
            walking[1] = true;
        }
    }
    else if(tempwalking == 4) {
        farfromhome++;
        if(Math.abs(farfromhome) > settings.maxstep) {
            farfromhome--;
            walking[1] = false;
        }
        else {
            walking[0] = 1;
            walking[1] = true;
        }
    }
    else walking[1] = false;
}, 1000);

ipcRenderer.on("getpos", () => {
    let wpos = win.getPosition();
    ipcRenderer.sendTo(settingWin.webContents.id, "wakpos", [wpos[0], wpos[1]]);
});

ipcRenderer.on("message", (event, msg) => {
    showMsg(msg[0], msg[1]);
});