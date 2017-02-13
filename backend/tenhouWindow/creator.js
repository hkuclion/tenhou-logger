const {BrowserWindow, dialog, app} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('../utility/app_path');
const {getTenhouMjstatus} = require('../utility/tenhou_path');

const WindowStateManager = require('electron-window-state-manager');
const tenhouWindowState = new WindowStateManager(path.basename(__dirname),{});

module.exports = function () {
	let window = new BrowserWindow({
		x:tenhouWindowState.x,
		y:tenhouWindowState.y,
		width:728,
		height:620,
		icon:path.join(backend_path, 'tenhou.ico'),
		useContentSize:true,
		autoHideMenuBar:true,
	});

	if (tenhouWindowState.maximized) {
		window.maximize();
	}

	window.setMenu(null);

	window.loadURL(url.format({
		pathname:path.join(frontend_path, path.basename(__dirname), 'index.html'),
		protocol:'file:',
		slashes:true
	}));

	window.on('close', () => {
		tenhouWindowState.saveState(window);
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
	});

	return window;
};