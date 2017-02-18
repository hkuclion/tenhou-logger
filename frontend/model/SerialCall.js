define(function () {
	let ipcRenderer = require('electron').ipcRenderer;
	let serial = 0;
	let stack = new Map();

	ipcRenderer.on('SERIAL_CALL',(ev,serial,data)=>{
		SerialCall.callback(serial,data);
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

		static callback(serial,data){
			let info = stack.get(serial);
			if(!info)return;

			info.resolve(data);
			stack.delete(serial);
		}
	}

	return SerialCall;
});
