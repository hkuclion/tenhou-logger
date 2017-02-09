const {BrowserWindow, app,dialog} = require('electron');
const WindowManager = require('./WindowManager');
require('./flash');

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
		app.quit()
	}
});

/* Mac
app.on('activate', function () {
	if (mainWindow === null) {
		mainWindow = require('./mainWindow.js');
	}
});*/
