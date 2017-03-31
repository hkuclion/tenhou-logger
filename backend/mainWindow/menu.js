const {app, Menu, MenuItem,dialog} = require('electron');
const WindowManager=require('../utility/WindowManager');
const Operation = require('./Operation');
const SerialCallback = require('./SerialCallback');
const ElectronConfig = require('electron-json-config');

let mainMenu = new Menu();
let menuItem_Paifu = new MenuItem({
	label:'牌谱',
	type:'submenu',
	submenu:[
		{
			label:'获取远程',
			click:function () {
				WindowManager.getWindow('main').webContents.send(
					'GET_PAIFU','remote'
				);
			},
			accelerator:'Ctrl+R'
		},
		{
			label:'查看本地',
			click:function() {
				WindowManager.getWindow('main').webContents.send(
					'GET_PAIFU','local'
				);
			},
			accelerator:'Ctrl+L'
		},
		{
			type:'separator',
		},
		{
			label:'编辑模式',
			type:'checkbox',
			click:function(menuItem){
				Operation.set_paifu_edit_mode(menuItem.checked);

				WindowManager.getWindow('main').webContents.send(
					'PAIFU_EDIT_MODE', menuItem.checked
				);
			},
			checked:ElectronConfig.get('paifu_edit_mode',false)
		},
	],
});

let menuItem_View = new MenuItem({
	label:'视图',
	type:'submenu',
	submenu:[
		{
			label:'刷新',
			accelerator:'F5',
			click:function (item, focusedWindow) {
				if (focusedWindow) focusedWindow.reload();
			}
		},
		{
			label:'重启程序',
			accelerator:'SHIFT+F5',
			click:function (item, focusedWindow) {
				app.relaunch();
				app.exit();
			}
		},
		{
			label:'全屏',
			accelerator:(() => process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11')(),
			click:function (item, focusedWindow) {
				if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
			}
		},
		{
			label:'开发者工具',
			accelerator:(() => process.platform === 'darwin' ? 'Alt+Command+I' : 'F12')(),
			click:function (item, focusedWindow) {
				if (focusedWindow) focusedWindow.toggleDevTools()
			}
		}
	],
});

let menuItem_Option = new MenuItem({
	label:'选项 (&C)',
	type:'submenu',
	submenu:[
		{
			label:'首选项 (&S)',
			click:function () {
				WindowManager.getWindow('config');
			},
		},
		/*{
			label:'清除配置',
			click:function(){
				require('electron-json-config').purge();
			}
		},*/
		{
			label:'牌谱来源配置',
			click:function (item, focusedWindow) {
				WindowManager.getWindow('paifuSourceConfig');
			}
		}
	],
});

let menuItem_Tenhou = new MenuItem({
	label:'天凤 (&T)',
	type:'submenu',
	submenu:[
		{
			label:'Flash版 (&F)',
			click:function () {
				WindowManager.getWindow('tenhouFlash')
			}
		},
		{
			label:'Web版 (&W)',
			click:function (item, focusedWindow) {
				WindowManager.getWindow('tenhouWeb');
			}
		}
	],
});

mainMenu.append(menuItem_Paifu);
mainMenu.append(menuItem_View);
mainMenu.append(menuItem_Option);
mainMenu.append(menuItem_Tenhou);

module.exports = function(window){
	window.setMenu(mainMenu);
};