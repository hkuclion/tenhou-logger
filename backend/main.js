const {BrowserWindow, app, Menu, MenuItem, dialog} = require('electron');
const path = require('path');
const url = require('url');
const actions = require('./AsyncAction.js');

const windowStateKeeper = require('electron-window-state');
const ElectronSettings = require('electron-settings');

let app_path = global.app_path = path.dirname(__dirname);
let backend_path = global.backend_path = path.join(app_path, 'backend');
let front_path = global.front_path = path.join(app_path, 'frontend');

//require('./flash.js');

let tenhouWindow;

function createWindow() {
	let mainWindowState = windowStateKeeper({
		defaultWidth:1280,
		defaultHeight:720
	});

	global.mainWindow = new BrowserWindow({
		x:mainWindowState.x,
		y:mainWindowState.y,
		width:mainWindowState.width,
		height:mainWindowState.height,
		icon:path.join(backend_path, 'images/lion.png'),
		webPreferences:{
			partition:'persist:logger'
		},
		show:false,
	});

	mainWindowState.manage(global.mainWindow);

	global.mainWindow.loadURL(url.format({
		pathname:path.join(front_path, 'index.html'),
		protocol:'file:',
		slashes:true
	}));

	let mainMenu = new Menu();
	let menuItem_Paifu= new MenuItem({
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
				click:actions.getLocalPaifu
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
					if (focusedWindow) focusedWindow.reload()
				}
			},
			{
				label:'全屏',
				accelerator:(function () {
					return (process.platform === 'darwin') ? 'Ctrl+Command+F' : 'F11'
				})(),
				click:function (item, focusedWindow) {
					if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
				}
			},
			{
				label:'开发者工具',
				accelerator:(function () {
					return (process.platform === 'darwin') ? 'Alt+Command+I' : 'F12';
				})(),
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
				click:actions.clearSetting
			},
		],
	});

	let menuItem_Tenhou = new MenuItem({
		label:'天凤',
		type:'normal',
		click:function(item, focusedWindow){
			
		}
	});

	mainMenu.append(menuItem_Paifu);
	mainMenu.append(menuItem_View);
	mainMenu.append(menuItem_Option);
	global.mainWindow.setMenu(mainMenu);

	global.mainWindow.on('closed', function () {
		global.mainWindow = null
	});
	global.mainWindow.on('ready-to-show', function () {
		global.mainWindow.show();
		global.mainWindow.focus();
	});
}

app.on('ready', ()=>{
	let shouldQuit = app.makeSingleInstance((cmdLine) => {
		global.mainWindow.focus();
		return true;
	});

	if (shouldQuit) app.quit(0);
	else createWindow();
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

app.on('activate', function () {
	if (global.mainWindow === null) {
		createWindow()
	}
});
