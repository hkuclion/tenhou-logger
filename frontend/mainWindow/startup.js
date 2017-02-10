requirejs.config({
	paths:{
		jquery:'../shared/jQuery/jquery-3.1.1.min',
		'artDialog/base':'../shared/artDialog/dialog-min',
		'artDialog/plus':'../shared/artDialog/dialog-plus-min',
		'artTemplate':'../shared/artTemplate/template',
		'hkuc':'../shared/hkuc',
	},
	shim:{
		jquery:{
			exports:'jQuery',
		},
		'artDialog/base':{
			deps:['jquery', 'css!vendor/artDialog/ui-dialog.css'],
			exports:'dialog',
		},
		'artDialog/plus':{
			deps:['./base'],
			exports:'dialog',
		},
	},
	map:{
		'*':{
			'css':'vendor/RequireJS/css.min.js'
		},
	}
});

define('artDialog/black', ['artDialog/plus', 'css!vendor/artDialog/black.css'], function (artDialog) {
	return artDialog;
});

requirejs(['manager/Setting','model/Controller'], function (Setting,Controller) {
	Setting.initialize().then(()=>{
		new Controller();
	});

	let ipcRenderer = require('electron').ipcRenderer;

	ipcRenderer.on('SHOW_PAIFU',(event,file)=>{
		console.log(file);
	})
});