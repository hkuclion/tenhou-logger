const {ipcMain} = require('electron');
const ElectronConfig = require('electron-json-config');
const WindowManager = require('../utility/WindowManager');
const SerialCallback = require('./SerialCallback');


let get_remote_paifu_conditions = {};

class Operation{
	static get_local_paifu(){
		let paifu_sources = ElectronConfig.get('paifu_sources',[]);
		if(!paifu_sources.length) return null;

		let default_paifu_source_index = ElectronConfig.get('default_paifu_source_index',-1);
		if(default_paifu_source_index<0)return null;

		let selected_paifu_source= paifu_sources[default_paifu_source_index];
		if(!selected_paifu_source)return null;

		let file_path=null;

		switch(selected_paifu_source.type){
			case 'win':
				let IniParser = require('../utility/IniParser');
				file_path = selected_paifu_source.file;
				let ini = IniParser.parse(file_path);
				let paifu_strings = ini.LOG;

				if (paifu_strings) {
					let latest_index = paifu_strings.N;
					return [...paifu_strings.slice(0, latest_index),...paifu_strings.slice(latest_index)].filter(value=>value.length);
				}
				return null;
			case 'local': {
				const {getTenhouMjinfo} = require('../utility/tenhou_path');
				file_path = getTenhouMjinfo();
			}
			case 'flash':{
				if(selected_paifu_source.file && !file_path)file_path = selected_paifu_source.file;
				if(!file_path)return null;

				const SolParser = require('../utility/SolParser');
				let sol = SolParser.parse(file_path);
				let logStr = sol.data.logstr;
				if(logStr)return logStr.split('\n').filter(value => value.length);
				return null;
			}
		}
	}

	static get_remote_paifu(){
		WindowManager.getWindow('main').webContents.send('GET_REMOTE_PAIFU');
	}
}

ipcMain.on('GET_LOCAL_PAIFU',(ev)=>{
	ev.returnValue = Operation.get_local_paifu();
});

module.exports = Operation;