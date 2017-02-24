define(function () {
	let ipcRenderer = require('electron').ipcRenderer;
	let serial = 0;
	let stack = new Map();

	ipcRenderer.on('SERIAL_CALL',(ev,serial,...args)=>{
		SerialCall.callback(serial, ...args);
	});

	class SerialCall{
		static call(type,data=null){
			let info = {
				type, data, serial:serial++
			};

			ipcRenderer.send('SERIAL_CALL', info.serial, type, data);

			stack.set(info.serial, info);

			return new Promise((resolve,reject)=>{
				Object.assign(info,{resolve,reject});
			});
		}

		static callback(serial,result,...args){
			let info = stack.get(serial);
			if(!info)return;
			if(result == 'success') {
				info.resolve(...args);
			}
			else{
				if(result === 'error'){
					let error = new window[args[0].name](args[0].description || args[0].message);
					Object.assign(error,args[0]);
					args[0] = error;
				}
				info.reject(...args);
			}

			stack.delete(serial);
		}
	}

	return SerialCall;
});
