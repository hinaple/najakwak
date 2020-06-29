const { remote, ipcRenderer } = require("electron")
const { app, getCurrentWindow } = remote;
const fs = require("fs");

const win = getCurrentWindow();
let parentId = null;

const maxstep = document.getElementById("maxstep");
const opacity = document.getElementById("opacity");
const endless = document.getElementById("endless");

const savepos = document.getElementById("savepos");
const apply = document.getElementById("apply");
const cancel = document.getElementById("cancel");

let obj = JSON.parse(fs.readFileSync(app.getPath("userData").replace(/\\/g, "/") + "/setting.json", "utf-8"));

maxstep.value = obj.maxstep;
opacity.value = obj.opacity;
endless.checked = obj.endless;
document.getElementById("result").value = opacity.value;

function updateObj() {
    obj.maxstep = maxstep.value;
    obj.opacity = opacity.value;
    obj.endless = endless.checked;
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

ipcRenderer.on("wakpos", (event, pos) => {
    obj.startx = pos[0];
    obj.starty = pos[1];
});

parentId = ipcRenderer.sendSync("getwakid");