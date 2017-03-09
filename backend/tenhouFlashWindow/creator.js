const {BrowserWindow, dialog, app, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('../utility/app_path');
const {getTenhouMjstatus} = require('../utility/tenhou_path');

const windowStateKeeper = require('electron-window-state');
let windowState = windowStateKeeper({
	defaultWidth:728,
	defaultHeight:620,
	file:'window_' + path.basename(__dirname) + '.json'
});

module.exports = function () {
	let window = new BrowserWindow({
		x:windowState.x,
		y:windowState.y,
		width:728,
		height:620,
		icon:path.join(backend_path, 'tenhou.ico'),
		useContentSize:true,
		autoHideMenuBar:true,
		webPreferences:{
			nodeIntegration:false,
			plugins:true,
			preload:path.join(backend_path, path.basename(__dirname), 'contextMenu.js'),
		}
	});
	windowState.manage(window);

	window.setMenu(null);
	
	window.loadURL('http://tenhou.net/0/',{
		postData:[{
			type: 'rawData',
			bytes: Buffer.from('wb=1')
		}],
		extraHeaders: 'Content-Type: application/x-www-form-urlencoded'
	});

	window.webContents.on('dom-ready',(ev)=>{
		window.webContents.executeJavaScript(`
			document.getElementsByTagName("embed")[0].addEventListener('contextmenu',function(event){
				FlashContextMenu();
				event.preventDefault();
				event.stopImmediatePropagation();
			},true);
		`);
	});
	window.webContents.on('context-menu', (ev) => {
		alert('context-menu');
		ev.preventDefault();
	});
	//window.webContents.openDevTools();

	ipcMain.on('FLASH_CONTEXT_MENU',()=>{
		window.webContents.sendInputEvent({
			type:'keyDown',
			keyCode:'Escape'
		});
		setTimeout(() => {
			window.webContents.sendInputEvent({
				type:'keyUp',
				keyCode:'Escape'
			});
		}, 50);
	});

	window.on('close',(ev)=>{
		let mjstatus = getTenhouMjstatus();
		if(mjstatus){
			ev.preventDefault();
			dialog.showMessageBox({
				type:'question',
				title:'确认',
				message:'检测到游戏正在进行中，确定要关闭窗口吗？',
				detail:'如果您还没有进入游戏，那这可能是由于上一次您强制关闭了游戏导致的，再次进入游戏将会解决这个问题。',
				buttons:['确定','取消'],
				defaultId:1,
				cancelId:1,
			},(button_index)=>{
				if(button_index == 0){
					window.destroy();
				}
			})
		}
		ipcMain.removeAllListeners('FLASH_CONTEXT_MENU');
	});

	return window;
};