const {BrowserWindow, dialog, ipcMain, Menu, MenuItem,app} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('./../utility/app_path');

const WindowStateManager = require('electron-window-state-manager');
const ElectronSettings = require('electron-settings');
ElectronSettings.defaults({
	sidebar_closed:false,
});

const mainWindowState = new WindowStateManager('mainWindow', {
	defaultWidth:1280,
	defaultHeight:720
});

module.exports = function(){
	let mainWindow = new BrowserWindow({
		x:mainWindowState.x,
		y:mainWindowState.y,
		width:mainWindowState.width,
		height:mainWindowState.height,
		icon:path.join(backend_path, 'lion.png'),
		show:false,
	});

	if (mainWindowState.maximized) {
		mainWindow.maximize();
	}

	require('./menu')(mainWindow);

	mainWindow.loadURL(url.format({
		pathname:path.join(frontend_path, 'mainWindow', 'index.html'),
		protocol:'file:',
		slashes:true
	}));

	mainWindow.on('close', () => {
		mainWindowState.saveState(mainWindow);
	});

	mainWindow.on('ready-to-show', () => {
		mainWindow.show();
		mainWindow.focus();
	});

	return mainWindow;
};