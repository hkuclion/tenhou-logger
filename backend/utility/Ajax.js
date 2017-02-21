const {net:Net} = require('electron');
const QS = require('qs');
const Url = require('url');

let default_options = {
	url:undefined,
	method:'GET',
	contentType:'application/x-www-form-urlencoded',
	data:undefined,
	context:undefined,
	dataType:'json',
	statusCode:{},
};

class Ajax{
	constructor(options){
		this.options = Object.assign({},default_options,options);
		this.request = new Net.ClientRequest(Object.assign({
			method:this.options.method,
			partition:'persist://tenhou-logger'
		},Url.parse(this.options.url)));

		let data = this.options.data;
		if(data) {
			this.request.setHeader('Content-Type', this.options.contentType);
			if (this.options.contentType == default_options.contentType && typeof data != 'string') {
				data = QS.stringify(data);
			}
		}
		this.request.end(data);

		return new Promise((resolve,reject)=>{
			this.request.on('response', (response) => {
				response.on('error', (e) => {
					reject(e);
				});

				response.on('close', () => {
					let responseText = '';
					for (let chunk of response.data) {
						if (!chunk)continue;
						responseText += chunk.toString();
					}

					if(typeof this.options.statusCode[response.statusCode] == 'function'){
						this.options.statusCode[response.statusCode].call(this.options.context, responseText);
					}

					let response_data = responseText;
					if (this.options.dataType == 'json') {
						try {
							response_data = JSON.parse(response_data);
						}
						catch (e) {
							reject(e, responseText);
						}
					}

					resolve(response_data);
				});
			});
		});
	}
}

module.exports = Ajax;