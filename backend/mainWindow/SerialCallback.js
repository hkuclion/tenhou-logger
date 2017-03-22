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

function get_user(){
	return ElectronConfig.get('user_data', false);
}
function login(login_data){
	let ajax = new Ajax({
		url:`${ElectronConfig.get('server')}/User/ajax_login`,
		method:'POST',
		data:login_data
	});

	return ajax.then((response_data) => {
		ElectronConfig.set('login_data', login_data);
		ElectronConfig.set('user_data', response_data.data);
		return response_data;
	});
}
function logout(){
	let ajax = new Ajax({
		url:`${ElectronConfig.get('server')}/User/ajax_logout`,
		method:'GET',
	});

	return ajax.then((response_data) => {
		ElectronConfig.delete('login_data');
		ElectronConfig.set('user_data', false);
		return response_data;
	});
}
function auto_login_ajax(ajax_options){
	let ajax = new Ajax(ajax_options);

	return new Promise((resolve,reject)=>{
		ajax.then((response_data) => {
			if (response_data && response_data.result == 'login') {
				let login_data = ElectronConfig.get('login_data', null);
				if (login_data) {
					login(login_data).then((response_data) => {
						if (response_data && response_data.result == 'success') {
							let ajax = new Ajax(ajax_options);
							ajax.then((response_data) => {
								resolve(response_data);
							})
						}
					});
				}
				else {
					resolve(response_data);
				}
			}
			else {
				resolve(response_data);
			}
		}, (error) => {
			reject(extractError(error));
		});
	});
}

function extractError(error){
	const {name, number, description, message, fileName, stack} = error;
	return {name, number, description, message, fileName, stack};
}

ipcMain.on('SERIAL_CALL', (ev, serial, type, data) => {
	switch (type) {
		case 'user': {
			ev.sender.send(`SERIAL_CALL_${serial}`, 'success', get_user());
			break;
		}
		case 'login':{
			login(data).then((response_data)=>{
				ev.sender.send(`SERIAL_CALL_${serial}`, 'success', response_data);
			}, (error) => {
				ev.sender.send(`SERIAL_CALL_${serial}`, 'error', extractError(error));
			});
			break;
		}
		case 'logout':{
			logout().then((response_data) => {
				ev.sender.send(`SERIAL_CALL_${serial}`, 'success', response_data);
			}, (error) => {
				ev.sender.send(`SERIAL_CALL_${serial}`, 'error', extractError(error));
			});
			break;
		}
		case 'ajax':{
			auto_login_ajax(data).then((response_data)=>{
				ev.sender.send(`SERIAL_CALL_${serial}`, 'success', response_data);
			},(error)=>{
				ev.sender.send(`SERIAL_CALL_${serial}`, 'error', error);
			});
		}
	}
});

module.exports = {
	get_user,
	login,
	logout,
	auto_login_ajax
};
