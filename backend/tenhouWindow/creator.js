const {BrowserWindow, dialog, app} = require('electron');
const path = require('path');
const url = require('url');
const {frontend_path, backend_path} = require('../utility/app_path');
const {getTenhouMjstatus} = require('../utility/tenhou_path');

const WindowStateManager = require('electron-window-state-manager');
const tenhouWindowState = new WindowStateManager('tenhouWindow',{});

module.exports = function () {
	let tenhouWindow = new BrowserWindow({
		x:tenhouWindowState.x,
		y:tenhouWindowState.y,
		width:728,
		height:620,
		icon:path.join(backend_path, 'tenhou.ico'),
	});

	if (tenhouWindowState.maximized) {
		tenhouWindow.maximize();
	}

	tenhouWindow.setMenu(null);

	tenhouWindow.loadURL(url.format({
		pathname:path.join(frontend_path, 'tenhouWindow', 'index.html'),
		protocol:'file:',
		slashes:true
	}));

	tenhouWindow.on('close', () => {
		tenhouWindowState.saveState(tenhouWindow);
	});

	tenhouWindow.on('close',(ev)=>{
		let mjstatus = getTenhouMjstatus();
		if(mjstatus){
			ev.preventDefault();
			dialog.showMessageBox({
				type:'question',
				title:'确认',
				message:'检测到游戏正在进行中，确定要关闭窗口吗？',
				buttons:['确定','取消'],
				defaultId:1,
				cancelId:1,
			},(button_index)=>{
				if(button_index == 0){
					tenhouWindow.destroy();
				}
			})
		}
	});

	return tenhouWindow;
};