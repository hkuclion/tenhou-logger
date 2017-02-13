requirejs.config({
	paths:{
		jquery:'../shared/jQuery/jquery-3.1.1.min',
		'artDialog/base':'../shared/artDialog/dialog-min',
		'artDialog/plus':'../shared/artDialog/dialog-plus-min',
		'artTemplate':'../shared/artTemplate/template',
		'hkuc':'../shared/hkuc',
		'css':'../shared/RequireJS/css.min',
		'shared/manager/Setting':'../shared/manager/Setting',
	},
	shim:{
		jquery:{
			exports:'jQuery',
		},
		'artDialog/base':{
			deps:['jquery', 'css!../../shared/artDialog/ui-dialog.css'],
			exports:'dialog',
		},
		'artDialog/plus':{
			deps:['./base'],
			exports:'dialog',
		},
	},
});

define('artDialog/black', ['artDialog/plus', 'css!../../shared/artDialog/black.css'], function (artDialog) {
	return artDialog;
});