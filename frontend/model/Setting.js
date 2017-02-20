define(function(){
	const ElectronSettings = require('electron').remote.require('electron-settings');

	let setting={};
	let ready_resolve;
	let readyPromise = new Promise((resolve)=>{
		ready_resolve = resolve;
	});

	return class Setting{
		static initialize(){
			return ElectronSettings.get().then((value)=>{
				ready_resolve();
				ready_resolve = null;
				Object.assign(setting,value);
			});
		}
		static get ready(){
			return readyPromise;
		}

		static get(keyPath){
			let paths = keyPath.split('.');

			let object = setting;
			for(let path of paths){
				if(object === null || object===undefined){
					return object;
				}
				object = object[path];
			}
			return object;
		}
		static set(keyPath, value){
			let keys = keyPath.split('.');

			let object = setting;
			while (keys.length > 1) {
				let key = keys.shift();
				if (typeof object != 'object') {
					object[key] = {};
				}
				object = object[key]
			}
			object[keys.shift()] = value;

			return ElectronSettings.set(keyPath, value);
		}
	}
});
