const {ipcMain} = require('electron');
const WindowManager = require('../utility/WindowManager');
const ElectronConfig = require('electron-json-config');
const Ajax = require('../utility/Ajax');

let server = ElectronConfig.get('server');
function extractError(error) {
	const {name, number, description, message, fileName, stack} = error;
	return {name, number, description, message, fileName, stack};
}

class Operation {
	static GET_USER() {
		return ElectronConfig.get('user_data', false);
	}

	static LOGIN(login_data) {
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

	static LOGOUT() {
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

	static SERVER_AJAX(ajax_options) {
		ajax_options.url = server+ ajax_options.url;
		let ajax = new Ajax(ajax_options);

		return new Promise((resolve, reject) => {
			ajax.then((response_data) => {
				if (response_data && response_data.result == 'login') {
					let login_data = ElectronConfig.get('login_data', null);
					if (login_data) {
						Operation.LOGIN(login_data).then((response_data) => {
							if (response_data && response_data.result == 'success') {
								let ajax = new Ajax(ajax_options);
								ajax.then((response_data) => {
									resolve(response_data);
								}, (error) => {
									reject(extractError(error));
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

	static AJAX(ajax_options){
		return new Promise((resolve, reject) => {
			ajax.then((response_data) => {
				resolve(response_data);
			}, (error) => {
				reject(extractError(error));
			});
		});
	}

	static GET_LOCAL_PAIFU() {
		return new Promise((resolve,reject)=>{
			let paifu_sources = ElectronConfig.get('paifu_sources', []);
			if (!paifu_sources.length) return null;

			let default_paifu_source_index = ElectronConfig.get('default_paifu_source_index', -1);
			if (default_paifu_source_index < 0)return null;

			let selected_paifu_source = paifu_sources[default_paifu_source_index];
			if (!selected_paifu_source)return null;

			let file_path = null;

			switch (selected_paifu_source.type) {
				case 'win': {
					let IniParser = require('../utility/IniParser');
					file_path = selected_paifu_source.file;
					let ini = IniParser.parse(file_path);
					if (!ini)return [];
					let paifu_strings = ini.LOG;

					if (paifu_strings) {
						let latest_index = paifu_strings.N;
						resolve([...paifu_strings.slice(0, latest_index), ...paifu_strings.slice(latest_index)].filter(value => value.length));
					}
					else {
						resolve([]);
					}
					break;
				}
				case 'localFlash': {
					const {getTenhouMjinfo} = require('../utility/tenhou_path');
					file_path = getTenhouMjinfo();
				}
				case 'flash': {
					if (selected_paifu_source.file && !file_path) file_path = selected_paifu_source.file;
					if (!file_path)return null;

					const SolParser = require('../utility/SolParser');
					let sol = SolParser.parse(file_path);
					if (!sol)return [];
					let logStr = sol.data.logstr;
					if (logStr) resolve( logStr.split('\n').filter(value => value.length));
					else resolve([]);
					break;
				}
				case 'localStorage': {
					let hidden_window = WindowManager.getWindow('tenhouHiddenWeb');
					hidden_window.webContents.on('dom-ready',()=>{
						hidden_window.webContents.executeJavaScript('get_logs()',(result)=>{
							hidden_window.close();
							let logStr = [];
							for(let item of result){
								let log = `file=${encodeURIComponent(item.log)}`;
								for(let i=0; i<item.uname.length;i++){
									log+=`&un${i}=${encodeURIComponent(item.uname[i])}`;
								}
								log+=`&oya=${item.oya}&type=${item.type}&sc=${item.sc}`;
								logStr.push(log);
							}
							resolve(logStr);
						});
					});
					break;
				}
			}
		});
	}

	static REVIEW_PAIFU(url, force = false) {
		return new Promise((resolve)=>{
			if (WindowManager.hasWindow('paifuReview')) {
				if (!force)return resolve(false);
				WindowManager.getWindow('paifuReview').reviewPaifu(url);
				return resolve(true);
			}

			WindowManager.getWindow('paifuReview', url);
			return resolve(true);
		});
	}

	static WATCH_GAME(url) {
		return new Promise((resolve) => {
			if (WindowManager.hasWindow('gameWatch')) {
				WindowManager.getWindow('gameWatch').watchGame(url);
				return resolve(true);
			}

			WindowManager.getWindow('gameWatch', url);
			return resolve(true);
		});
	}
}

ipcMain.on('SERIAL_CALL', async (ev, serial, type, ...data) => {
	if(type in Operation){
		try {
			ev.sender.send(`SERIAL_CALL_${serial}`, 'success', await Operation[type](...data));
		}
		catch (error){
			ev.sender.send(`SERIAL_CALL_${serial}`, 'error', extractError(error));
		}
	}
});

module.exports = Operation;