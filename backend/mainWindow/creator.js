const {BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('./../utility/app_path');

const windowStateKeeper = require('electron-window-state');

require('./SerialCallback');

let windowState = windowStateKeeper({
	defaultWidth:1280,
	defaultHeight:720,
	file:'window_'+ path.basename(__dirname)+'.json'
});

module.exports = function(){
	let window = new BrowserWindow({
		x:windowState.x,
		y:windowState.y,
		width:windowState.width,
		height:windowState.height,
		icon:path.join(backend_path, 'lion.png'),
		backgroundColor:'#55a9f1',
		show:false,
	});

	windowState.manage(window);

	require('./menu')(window);

	window.loadURL(url.format({
		pathname:path.join(frontend_path, path.basename(__dirname)+'.html'),
		protocol:'file:',
		slashes:true
	}));

	window.on('ready-to-show', () => {
		window.show();
		window.focus();
	});

	window.webContents.executeJavaScript(`
      require('electron').ipcRenderer.on('console.log',(ev,...args)=>{
		console.log(...args);
	  });
    `);

	return window;
};





