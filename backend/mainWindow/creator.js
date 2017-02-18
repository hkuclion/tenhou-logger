const {BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('./../utility/app_path');

const WindowStateManager = require('electron-window-state-manager');
const ElectronSettings = require('electron-settings');
ElectronSettings.defaults({
	sidebar_closed:false,
	login_data:null
});

require('./SerialCallback');

const mainWindowState = new WindowStateManager(path.basename(__dirname), {
	defaultWidth:1280,
	defaultHeight:720
});

module.exports = function(){
	let window = new BrowserWindow({
		x:mainWindowState.x,
		y:mainWindowState.y,
		width:mainWindowState.width,
		height:mainWindowState.height,
		icon:path.join(backend_path, 'lion.png'),
		backgroundColor:'#55a9f1',
		show:false,
	});

	if (mainWindowState.maximized) {
		window.maximize();
	}

	require('./menu')(window);

	window.loadURL(url.format({
		pathname:path.join(frontend_path, path.basename(__dirname)+'.html'),
		protocol:'file:',
		slashes:true
	}));

	window.on('close', () => {
		mainWindowState.saveState(window);
	});

	window.on('ready-to-show', () => {
		window.show();
		window.focus();
	});

	return window;
};





