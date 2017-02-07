requirejs.config({
	baseUrl:'.',
	paths:{
		jquery:'vendor/jQuery/jquery-3.1.1.min',
		'artDialog/base':'vendor/artDialog/dialog-min',
		'artDialog/plus':'vendor/artDialog/dialog-plus-min',
		'artTemplate':'vendor/artTemplate/template',
		'hkuc':'vendor/hkuc',
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

requirejs(['model/Controller','hkuc/dialog'], function (Controller, HkucDialog) {
	let controller=new Controller();
	const ipcRenderer = require('electron').ipcRenderer;

	ipcRenderer.on('set_paifu_source', (event)=>{
		HkucDialog.confirm('配置来源', null, () => {
			event.sender.send('set_paifu_source', ['Win', 'Flash'])
		});
	});

	ipcRenderer.on('select_paifu_source', function (event, paifu_sources) {
		let options = {};
		for (let paifu_source of paifu_sources) {
			options[paifu_source] = paifu_source;
		}

		HkucDialog.form([{
			name:'paifu_source', type:'radio', label:'牌谱来源', options
		}], {title:'选择来源'}, (value) => {
			event.sender.send('select_paifu_source', value.paifu_source);
		});
	});

	ipcRenderer.on('setting_cleared', function (event) {
		HkucDialog.alert('配置已清除');
	});
});