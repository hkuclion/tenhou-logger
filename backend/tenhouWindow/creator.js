const {BrowserWindow, dialog, ipcMain, Menu, MenuItem} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('./../app_path');

const WindowStateManager = require('electron-window-state-manager');
const tenhouWindowState = new WindowStateManager('tenhouWindow',{});

module.exports = function () {
	let tenhouWindow = new BrowserWindow({
		x:tenhouWindowState.x,
		y:tenhouWindowState.y,
		width:728,
		height:620,
		icon:path.join(backend_path, 'tenhou.ico'),
	});

	if (tenhouWindowState.maximized) {
		tenhouWindow.maximize();
	}

	tenhouWindow.setMenu(null);

	tenhouWindow.loadURL(url.format({
		pathname:path.join(frontend_path, 'tenhouWindow', 'index.html'),
		protocol:'file:',
		slashes:true
	}));

	tenhouWindow.on('close', () => {
		tenhouWindowState.saveState(tenhouWindow);
	});

	return tenhouWindow;
};