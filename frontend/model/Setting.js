define(function(){
	const ElectronConfig = require('electron').remote.require('electron-json-config');

	return class Setting{
		static get(keyPath){
			return ElectronConfig.get(keyPath);
		}
		static set(keyPath, value){
			return ElectronConfig.set(keyPath,value);
		}
	}
});
