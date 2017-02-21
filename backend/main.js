const {BrowserWindow, app,dialog} = require('electron');
const WindowManager = require('./utility/WindowManager');

//flash support
let ppapi_flash_path = null;
try {
	ppapi_flash_path = app.getPath('pepperFlashSystemPlugin');
	if (ppapi_flash_path) {
		app.commandLine.appendSwitch('ppapi-flash-path', ppapi_flash_path);
	}
} catch (e) { }

global.alert = (message) => {
	if(typeof(message) != 'string'){
		message = JSON.stringify(message);
	}
	dialog.showMessageBox({title:'alert',detail:message});
};

app.on('ready', () => {
	let mainWindow;

	let shouldQuit = app.makeSingleInstance((cmdLine) => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
		return true;
	});

	if (shouldQuit) app.quit(0);
	else mainWindow = WindowManager.getWindow('main');
});

app.on('window-all-closed', ()=> {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

/* Mac
app.on('activate', function () {
	if (mainWindow === null) {
		mainWindow = require('./mainWindow.js');
	}
});*/
