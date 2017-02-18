const {BrowserWindow, dialog, app} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('../utility/app_path');

const WindowStateManager = require('electron-window-state-manager');
const tenhouWindowState = new WindowStateManager(path.basename(__dirname),{
	defaultWidth:1280,
	defaultHeight:720
});

module.exports = function () {
	let window = new BrowserWindow({
		x:tenhouWindowState.x,
		y:tenhouWindowState.y,
		width:tenhouWindowState.width,
		height:tenhouWindowState.height,
		icon:path.join(backend_path, 'tenhou.ico'),
		useContentSize:true,
		autoHideMenuBar:true,
		webPreferences:{
			preload:path.join(backend_path, path.basename(__dirname),'WrapWebSocket.js'),
			nodeIntegration:false,
		}
	});

	if (tenhouWindowState.maximized) {
		window.maximize();
	}

	window.setMenu(null);

	window.loadURL('http://tenhou.net/3/',{
		httpReferrer:'http://tenhou.net/0/'
	});

	window.webContents.openDevTools();

	window.on('close', () => {
		tenhouWindowState.saveState(window);
	});

	return window;
};