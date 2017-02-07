const {BrowserWindow, app, Menu, MenuItem, dialog} = require('electron');
const path = require('path');
const url = require('url');
const actions = require('./AsyncAction.js');

const WindowStateManager = require('electron-window-state-manager');
const ElectronSettings = require('electron-settings');

let app_path = global.app_path = path.dirname(__dirname);
let backend_path = global.backend_path = path.join(app_path, 'backend');
let front_path = global.front_path = path.join(app_path, 'frontend');

//require('./flash.js');

let tenhouWindow;
let mainWindow;

function createWindow() {
	const mainWindowState = new WindowStateManager('mainWindow', {
		defaultWidth:1280,
		defaultHeight:720
	});

	global.mainWindow = mainWindow = new BrowserWindow({
		x:mainWindowState.x,
		y:mainWindowState.y,
		width:mainWindowState.width,
		height:mainWindowState.height,
		icon:path.join(backend_path, 'images/lion.png'),
	});

	if (mainWindowState.maximized) {
		mainWindow.maximize();
	}

	mainWindow.loadURL(url.format({
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
				accelerator:(()=>process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11')(),
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
				click:actions.clearSetting
			},
		],
	});

	let menuItem_Tenhou = new MenuItem({
		label:'天凤',
		type:'normal',
		click:function (item, focusedWindow) {

		}
	});

	mainMenu.append(menuItem_Paifu);
	mainMenu.append(menuItem_View);
	mainMenu.append(menuItem_Option);
	mainWindow.setMenu(mainMenu);

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	mainWindow.on('close',()=>{
		mainWindowState.saveState(mainWindow);
	});

	mainWindow.on('ready-to-show', ()=>{
		mainWindow.show();
		mainWindow.focus();
	});
}

app.on('ready', () => {
	let shouldQuit = app.makeSingleInstance((cmdLine) => {
		if (mainWindow) {
			mainWindow.focus();
		}
		return true;
	});

	if (shouldQuit) app.quit(0);
	else createWindow();
});

app.on('window-all-closed', ()=> {
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow()
	}
});
