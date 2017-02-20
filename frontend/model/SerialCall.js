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
				info.reject(...args);
			}

			stack.delete(serial);
		}
	}

	return SerialCall;
});
