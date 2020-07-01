const { remote, ipcRenderer } = require("electron")
const { app, getCurrentWindow, BrowserWindow } = remote;
const fs = require("fs");

const win = getCurrentWindow();

const maxstep = document.getElementById("maxstep");
const opacity = document.getElementById("opacity");
const endless = document.getElementById("endless");
const shwmesi = document.getElementById("shwMesi");
const onshadow = document.getElementById("onshadow");
const speed = document.getElementById("speed");

const savepos = document.getElementById("savepos");
const apply = document.getElementById("apply");
const cancel = document.getElementById("cancel");
const autosta = document.getElementById("autosta");

let obj = JSON.parse(fs.readFileSync(app.getPath("userData").replace(/\\/g, "/") + "/setting.json", "utf-8"));

maxstep.value = obj.maxstep;
opacity.value = obj.opacity;
speed.value = obj.speed;
endless.checked = obj.endless;
shwmesi.checked = obj.shwmesi;
onshadow.checked = obj.onshadow;
document.getElementById("result").value = opacity.value;
document.getElementById("resultspd").value = speed.value;

function updateObj() {
    obj.maxstep = Number(maxstep.value);
    obj.opacity = Number(opacity.value);
    obj.speed = Number(speed.value);
    obj.endless = endless.checked;
    obj.shwmesi = shwmesi.checked;
    obj.onshadow = onshadow.checked;
}

savepos.addEventListener("click", () => {
    ipcRenderer.sendTo(parentId, "getpos");
    apply.disabled = false;
});

apply.addEventListener("click", () => {
    apply.disabled = true;
    fs.writeFileSync(app.getPath("userData").replace(/\\/g, "/") + "/setting.json", JSON.stringify(obj), "utf-8");
    ipcRenderer.sendTo(parentId, "message", [ "오영택님에게서 온 메시지", "어~ 저장 완료~ 프로그램 재시작하면 적용돼요~" ]);
});

cancel.addEventListener("click", () => {
    win.close();
});

autosta.addEventListener("click", () => {
    if(!app.getLoginItemSettings({ path: app.getPath("exe") }).openAtLogin) {
        app.setLoginItemSettings({
            openAtLogin: true,
            path: app.getPath("exe")
        });
        ipcRenderer.sendTo(parentId, "message", [ "오영택님에게서 온 메시지", "이제부터 컴퓨터 켜지자마자 달려올거에요. 아시겠어요?" ])
    }
    else {
        app.setLoginItemSettings({
            openAtLogin: false,
            path: app.getPath("exe")
        });
        ipcRenderer.sendTo(parentId, "message", [ "오영택님에게서 온 메시지", "이제 자동으로 안켜지고 니가 직접 키세요~" ])
    }
});

ipcRenderer.on("wakpos", (event, pos) => {
    obj.startx = pos[0];
    obj.starty = pos[1];
});

let parentId = BrowserWindow.fromId(ipcRenderer.sendSync("getwakwin")).webContents.id;