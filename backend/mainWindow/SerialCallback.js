const {ipcMain} = require('electron');
const Ajax = require('../utility/Ajax');
const ElectronSettings = require('electron-settings');

//http://blog.csdn.net/shawyeok/article/details/41749045
let urlEncode = function (param, key, encode) {
	if (param == null) return '';
	let paramStr = '';
	let t = typeof (param);
	if (t == 'string' || t == 'number' || t == 'boolean') {
		paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
	} else {
		for (let i in param) {
			if(!param.hasOwnProperty(i))continue;
			let k = key == null ? i : key + '[' + i + ']';
			paramStr += urlEncode(param[i], k, encode);
		}
	}
	return paramStr;
};

ipcMain.on('SERIAL_CALL', (ev, serial, type, data) => {
	switch (type) {
		case 'user': {
			ElectronSettings.get('user_data').then((user_data) => {
				ev.sender.send('SERIAL_CALL', serial,'success', user_data);
			},(error)=>{
				ev.sender.send('SERIAL_CALL', serial, 'error', error);
			});
			break;
		}
		case 'login':{
			let ajax = new Ajax({
				url:'http://local.hkuclion.com/User/ajax_login',
				method:'POST',
				//data:`User%5Busername%5D=${encodeURIComponent(data.User.username)}&User%5Bpassword%5D=${encodeURIComponent(data.User.password)}`//data,
				data
			});

			ajax.then((data)=>{
				ElectronSettings.set('user_data', data.data).then(()=>{
					ev.sender.send('SERIAL_CALL', serial, 'success', data);
				});
			},(error)=>{
				ev.sender.send('SERIAL_CALL', serial, 'error', error);
			});
			break;
		}
		case 'logout':{
			let ajax = new Ajax({
				url:'http://local.hkuclion.com/User/ajax_logout',
				method:'GET',
			});

			ajax.then((data) => {
				ElectronSettings.set('user_data', data.data).then(()=>{
					ev.sender.send('SERIAL_CALL', serial, 'success', data);
				});
			}, (error) => {
				ev.sender.send('SERIAL_CALL', serial, 'error', error);
			});
			break;
		}
	}
});


