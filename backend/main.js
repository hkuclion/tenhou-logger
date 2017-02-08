const {BrowserWindow, app,dialog} = require('electron');

let windows={};




app.on('ready', () => {
	let shouldQuit = app.makeSingleInstance((cmdLine) => {
		if (windows.main) {
			if (windows.main.isMinimized()) windows.main.restore();
			windows.main.focus();
		}
		return true;
	});

	if (shouldQuit) app.quit(0);
	else windows.main = require('./mainWindow/window.js');
});

app.on('window-all-closed', ()=> {
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

/* Mac
app.on('activate', function () {
	if (windows.main === null) {
		windows.main = require('./mainWindow.js');
	}
});*/
