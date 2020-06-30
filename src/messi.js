const { remote, ipcRenderer } = require("electron");
const { app, BrowserWindow, getCurrentWindow } = remote;

const WINDOW_WIDTH = 100;
const WINDOW_HEIGHT = 100;

const CHAR_WIDTH = 72;
const CHAR_HEIGHT = 72;

const win = getCurrentWindow();
const parent = BrowserWindow.fromId(ipcRenderer.sendSync("getwakwin"));
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ipcRenderer.sendTo(parent.webContents.id, "settings");
ipcRenderer.on("settings", (event, set) => {
    if(set.onshadow) {
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 7;
    }
    ctx.globalAlpha = set.opacity / 100;
});
ctx.imageSmoothingEnabled = false;

let time = 0;
let walking = [ 0, false ];
let imgs = {
    mesi: [],
    mesiwalk: []
};

const imgcnt = {
    mesi: 2,
    mesiwalk: 4
};

for(name in imgs) {
    for(let i = 0; i < 2; i++) {
        imgs[name].push([]);
        for(let j = 0; j < imgcnt[name]; j++) {
            imgs[name][i].push(new Image());
            imgs[name][i][j].src = "../imgs/" + name + (i == 0? '': 'r') + j + ".png";
        }
    }
}

setInterval(() => {
    ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    time++;
    if(time >= 60) time = 0;

    let wakPos = parent.getPosition();
    let mesPos = win.getPosition();
    let minus = [ wakPos[0] - mesPos[0] + 7, wakPos[1] - mesPos[1] + 128 ];
    win.setPosition(mesPos[0] + Math.round(minus[0] / 3), mesPos[1] + Math.round(minus[1] / 3));
    if(Math.abs(minus[0]) > 1 || Math.abs(minus[1]) > 1) {
        if(Math.abs(minus[0]) > 1) walking[0] = (minus[0] > 0)? 1: 0;
        walking[1] = true;
    }
    else walking[1] = false;

    let tempImg = null;
    if(!walking[1]) tempImg = imgs.mesi[walking[0]][Math.floor(time / 30) % 2];
    else tempImg = imgs.mesiwalk[walking[0]][Math.floor(time / 15) % 4];

    ctx.drawImage(tempImg, 7, 0, CHAR_WIDTH, CHAR_HEIGHT);
}, 15);