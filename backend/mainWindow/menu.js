const {app, Menu, MenuItem,dialog} = require('electron');
const WindowManager=require('../WindowManager');

let mainMenu = new Menu();
let menuItem_Paifu = new MenuItem({
	label:'牌谱',
	type:'submenu',
	submenu:[
		{
			label:'获取远程',
			click:function () {
				dialog.showMessageBox({
					type:'info',
					title:'提示',
					message:'Click'
				});
			},
		},
		{
			label:'上传远程',
			click:function () {
				dialog.showMessageBox({
					type:'info',
					title:'提示',
					message:'Click'
				});
			},
		},
		{
			label:'查看本地',
			click:function(){

			}//actions.getLocalPaifu
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
	label:'选项',
	type:'submenu',
	submenu:[
		{
			label:'清除配置',
			click:function(){

			}//actions.clearSetting
		},
	],
});

let menuItem_Tenhou = new MenuItem({
	label:'天凤',
	type:'normal',
	click:function (item, focusedWindow) {
		WindowManager.getWindow('tenhou')
	}
});

mainMenu.append(menuItem_Paifu);
mainMenu.append(menuItem_View);
mainMenu.append(menuItem_Option);
mainMenu.append(menuItem_Tenhou);

module.exports = function(mainWindow){
	mainWindow.setMenu(mainMenu);
};