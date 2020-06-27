const { app, Tray, Menu, getCurrentWindow } = require("electron").remote;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const WINDOW_WIDTH = 200;
const WINDOW_HEIGHT = 200;

const CHAR_WIDTH = 72;
const CHAR_HEIGHT = 180;

const win = getCurrentWindow();

tray = new Tray("wakdoo.ico");
const contextMenu = Menu.buildFromTemplate([
    {
        label: "옮기기 모드",
        type: "checkbox",
        checked: false,
        click: () => {
            movable = !movable;
            win.setIgnoreMouseEvents(!movable);
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

tray.displayBalloon({
    icon: "wakdoo.ico",
    title: "오영택님에게서 온 메시지",
    content: "여기 우측 하단 트레이에서 제 얼굴 우클릭하시면 끌 수 있어요~ 어... 킹아~",
    nosound: true
});

let imgs = {
    default: [],
    walk: []
};

let imgcnt = {
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

setInterval(() => {
    ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    time++;
    if(time >= 60) time = 0;

    let winpos = win.getPosition();
    
    let tempImg = null;
    if(!walking[1]) tempImg = imgs.default[walking[0]][Math.floor(time / 30) % 2];
    else {
        win.setPosition(winpos[0] + (walking[0] == 0? 1: -1), winpos[1]);
        tempImg = imgs.walk[walking[0]][Math.floor(time / 15) % 4];
    }
    
    ctx.drawImage(tempImg, (WINDOW_WIDTH - CHAR_WIDTH) / 2, WINDOW_HEIGHT - CHAR_HEIGHT, CHAR_WIDTH, CHAR_HEIGHT);
}, 15);

setInterval(() => {
    tempwalking = Math.floor(Math.random() * 5);
    if(tempwalking == 0) {
        walking[0] = 0;
        walking[1] = true;
        farfromhome--;
        if(Math.abs(farfromhome) > 2) walking[0] = 1;
    }
    else if(tempwalking == 4) {
        walking[0] = 1;
        walking[1] = true;
        farfromhome++;
        if(Math.abs(farfromhome) > 2) walking[0] = 0;
    }
    else walking[1] = false;
}, 1000);