const COMMAND = "evalCode";

function handleContextMenu(event) {
    event.contextMenu.appendContextMenuItem(COMMAND, "Eval selected code");
}

function handleDOMContextMenu(event) {
    safari.self.tab.setContextMenuEventUserInfo(event, window.getSelection().toString());
}

function handleCommand(event) {
    if(event.command===COMMAND) {
        evalCode(event.userInfo);
    }
}

function evalCode(code) {
    alert(code);
}

if(document) {
    document.addEventListener("contextmenu", handleDOMContextMenu, false);
}