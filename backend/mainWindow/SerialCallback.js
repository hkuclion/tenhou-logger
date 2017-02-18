const {ipcMain, net} = require('electron');
const ElectronSettings = require('electron-settings');
let user=null;
ElectronSettings.get('user_data').then((user_data)=>{
	user = user_data;
});

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

ipcMain.on('SERIAL_CALL', (ev, serial, type, data) => {
	switch (type) {
		case 'user': {
			ev.sender.send('SERIAL_CALL', serial, user);
			break;
		}
		case 'login':{
			const request = new net.ClientRequest({
				method:'POST',
				protocol:'http:',
				hostname:'hkuclion.com',
				port:80,
				path:'/User/ajax_login',
				partition:'persist://tenhou-logger'
			});
			request.setHeader('Content-Type','application/x-www-form-urlencoded');

			request.end(urlEncode(data));
			request.on('response', (response) => {
				response.on('close',()=>{
					let responseText = '';
					for(let chunk of response.data){
						if(!chunk)continue;
						responseText+= chunk.toString();
					}

					let response_data = responseText;
					try{
						response_data = JSON.parse(response_data);
						if (response_data.result == 'success') {
							user = response_data.data;
							ElectronSettings.set('login_data',data).then(()=>{
								ElectronSettings.setSync('user_data', user);
							});
						}
					}
					catch (e){}
					ev.sender.send('SERIAL_CALL', serial, response_data);
				})
			});
		}
	}
});


