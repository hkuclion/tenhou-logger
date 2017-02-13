const {BrowserWindow, dialog} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('../utility/app_path');
const WindowManager = require('../utility/WindowManager');

module.exports = function () {
	let window = new BrowserWindow({
		center:true,
		width:600,
		height:300,
		parent:WindowManager.getWindow('main'),
		modal:true,
		icon:path.join(backend_path, 'lion.png'),
	});

	window.loadURL(url.format({
		pathname:path.join(frontend_path, path.basename(__dirname), 'index.html'),
		protocol:'file:',
		slashes:true
	}));

	window.setMenu(null);

	return window;
};
