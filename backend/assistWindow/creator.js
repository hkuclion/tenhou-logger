const {BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('../utility/app_path');
const WindowManager = require('../utility/WindowManager');

const windowStateKeeper = require('electron-window-state');
let windowState = windowStateKeeper({
	defaultWidth:800,
	defaultHeight:600,
	file:'window_' + path.basename(__dirname) + '.json'
});

module.exports = function () {
	let window = new BrowserWindow({
		x:windowState.x,
		y:windowState.y,
		width:windowState.width,
		height:windowState.height,
		useContentSize:true,
		autoHideMenuBar:true,
		//parent:WindowManager.getWindow('tenhouWeb'),
	});
	windowState.manage(window);
	//window.setMenu(null);

	window.loadURL(url.format({
		pathname:path.join(frontend_path, path.basename(__dirname) + '.html'),
		protocol:'file:',
		slashes:true
	}));

	window.webContents.openDevTools();
	window.on('close',()=>{
		ipcMain.removeAllListeners('TENHOU_WEB_MESSAGE');
	});

	ipcMain.on('TENHOU_WEB_MESSAGE', (ev,data)=>{
		window.webContents.send('TENHOU_WEB_MESSAGE',data);
	});

	return window;
};