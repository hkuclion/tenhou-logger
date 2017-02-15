requirejs(['model/Setting', 'model/mainWindow/Controller'], function (Setting, Controller,dialog) {
	Setting.initialize().then(() => {
		new Controller();
	});
});
