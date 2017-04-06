const {BrowserWindow, dialog, app, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('../utility/app_path');
const {getTenhouMjstatus} = require('../utility/tenhou_path');

const windowStateKeeper = require('electron-window-state');
let windowState = windowStateKeeper({
	defaultWidth:728,
	defaultHeight:620,
	file:'window_' + path.basename(__dirname) + '.json'
});

module.exports = function (url=null) {
	let window = new BrowserWindow({
		x:windowState.x,
		y:windowState.y,
		width:728,
		height:620,
		icon:path.join(backend_path, 'tenhou.ico'),
		useContentSize:true,
		autoHideMenuBar:true,
		webPreferences:{
			nodeIntegration:false,
			plugins:true,
		}
	});
	windowState.manage(window);

	window.setMenu(null);

	window.reviewPaifu=function(url){
		window.loadURL(url, {
			postData:[{
				type:'rawData',
				bytes:Buffer.from('wb=0')
			}],
			extraHeaders:'Content-Type: application/x-www-form-urlencoded'
		});
	};

	if(url){
		window.reviewPaifu(url);
	}

	return window;
};