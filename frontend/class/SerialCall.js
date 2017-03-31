define(function () {
	let ipcRenderer = require('electron').ipcRenderer;
	let static_serial = 0;

	class SerialCall{
		static call(type,data=null){

			return new Promise((resolve,reject)=>{
				let serial = static_serial++;

				ipcRenderer.once(`SERIAL_CALL_${serial}`, (ev, result, ...args) => {
					if (result == 'success') {
						resolve(...args);
					}
					else{
						if (result === 'error') {
							let error = new window[args[0].name](args[0].description || args[0].message);
							Object.assign(error, args[0]);
							args[0] = error;
						}
						reject(...args);
					}
				});
				ipcRenderer.send('SERIAL_CALL', serial, type, data);
			});
		}
	}

	return SerialCall;
});
