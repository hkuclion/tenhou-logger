const ElectronConfig = require('electron-json-config');

class Operation{
	static get_local_paifu(){
		let paifu_sources = ElectronConfig.get('paifu_sources',[]);
		if(!paifu_sources.length) return null;

		let default_paifu_source_index = ElectronConfig.get('default_paifu_source_index',-1);
		if(default_paifu_source_index<0)return null;

		let selected_paifu_source= paifu_sources[default_paifu_source_index];
		if(!selected_paifu_source)return null;

		switch(selected_paifu_source.type){
			case 'win':
				let IniParser = require('../utility/IniParser');
				let ini = IniParser.parse(selected_paifu_source.file);
				let paifu_strings = ini.LOG;

				if (paifu_strings) {
					let latest_index = paifu_strings.N;
					return [...paifu_strings.slice(0, latest_index),...paifu_strings.slice(latest_index)];
				}
				return null;
			case 'local': {
				const {getTenhouMjinfo} = require('../utility/tenhou_path');
				selected_paifu_source.file = getTenhouMjinfo();
			}
			case 'flash':{
				if(!selected_paifu_source.file)return null;
				const SolParser = require('../utility/SolParser');
				let sol = SolParser.parse(selected_paifu_source.file);
				let logStr = sol.data.logstr;
				if(logStr)return logStr.split('\n');
				return null;
			}
		}
	}
}

module.exports = Operation;