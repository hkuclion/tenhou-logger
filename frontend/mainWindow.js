requirejs(['model/Setting', 'model/mainWindow/Controller'], function (Setting, Controller) {
	Setting.initialize();
	new Controller();
});
