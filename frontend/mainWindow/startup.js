requirejs(['shared/manager/Setting', 'model/Controller','hkuc/dialog'], function (Setting, Controller,HKUCDialog) {
	Setting.initialize().then(() => {
		new Controller();
	});

	let ipcRenderer = require('electron').ipcRenderer;

	ipcRenderer.on('SHOW_PAIFU', (event, file) => {
		HKUCDialog.alert(file,{title:'牌谱内容',maxWidth:'80%'});
	})
});