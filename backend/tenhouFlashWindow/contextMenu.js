let ipcRenderer = require('electron').ipcRenderer;

window.FlashContextMenu = function(){
	ipcRenderer.send('FLASH_CONTEXT_MENU');
};