document.addEventListener("contextmenu", handleDOMContextMenu, false);

function handleDOMContextMenu(event) {
    safari.self.tab.setContextMenuEventUserInfo(event, window.getSelection().toString());
}