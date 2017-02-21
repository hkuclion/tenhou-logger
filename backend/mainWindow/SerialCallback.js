const {ipcMain} = require('electron');
const Ajax = require('../utility/Ajax');
const ElectronConfig = require('electron-json-config');

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
			ev.sender.send('SERIAL_CALL', serial, 'success', ElectronConfig.get('user_data',null));
			break;
		}
		case 'login':{
			let ajax = new Ajax({
				url:'http://local.hkuclion.com/User/ajax_login',
				method:'POST',
				data
			});

			ajax.then((response_data)=>{
				ElectronConfig.set('login_data', data);
				ElectronConfig.set('user_data', response_data.data);
				ev.sender.send('SERIAL_CALL', serial, 'success', response_data);
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
				ElectronConfig.delete('login_data');
				ElectronConfig.set('user_data', data.data);
				ev.sender.send('SERIAL_CALL', serial, 'success', data);
			}, (error) => {
				ev.sender.send('SERIAL_CALL', serial, 'error', error);
			});
			break;
		}
	}
});


