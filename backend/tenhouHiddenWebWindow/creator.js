const {BrowserWindow, dialog, app} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('../utility/app_path');

module.exports = function () {
	let window = new BrowserWindow({
		show:false,
		webPreferences:{
			preload:path.join(backend_path, path.basename(__dirname), 'preload.js'),
			nodeIntegration:false,
		}
	});

	window.loadURL('http://tenhou.net/3/',{
		httpReferrer:'http://tenhou.net/0/'
	});

	return window;
};