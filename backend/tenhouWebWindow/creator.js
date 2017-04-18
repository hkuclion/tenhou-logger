const {BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('../utility/app_path');

const windowStateKeeper = require('electron-window-state');
let windowState = windowStateKeeper({
	defaultWidth:1280,
	defaultHeight:720,
	file:'window_' + path.basename(__dirname) + '.json'
});

module.exports = function () {
	let window = new BrowserWindow({
		x:windowState.x,
		y:windowState.y,
		width:windowState.width,
		height:windowState.height,
		icon:path.join(backend_path, 'tenhou.ico'),
		useContentSize:true,
		autoHideMenuBar:true,
		webPreferences:{
			preload:path.join(backend_path, path.basename(__dirname),'WrapWebSocket.js'),
			nodeIntegration:false,
		}
	});
	windowState.manage(window);

	window.setMenu(null);

	window.loadURL('http://tenhou.net/3/',{
		httpReferrer:'http://tenhou.net/0/'
	});

	window.webContents.on('dom-ready', (ev) => {
		window.webContents.executeJavaScript(`
			document.body.style.overflow="hidden";
		`);
	});

	//window.webContents.openDevTools();

	return window;
};