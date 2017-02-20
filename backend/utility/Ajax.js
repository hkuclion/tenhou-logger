const {net:Net} = require('electron');

const Url = require('url');

//http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object/1714899#1714899
let param = function (a) {
	let s = [], rbracket = /\[\]$/,
		add = function (k, v) {
			v = typeof v === 'function' ? v() : v === null ? '' : v === undefined ? '' : v;
			s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
		}, buildParams = function (prefix, obj) {
			let len;

			if (prefix) {
				if (Array.isArray(obj)) {
					for (let i = 0, len = obj.length; i < len; i++) {
						if (rbracket.test(prefix)) {
							add(prefix, obj[i]);
						} else {
							buildParams(prefix + '[' + (typeof obj[i] === 'object' ? i : '') + ']', obj[i]);
						}
					}
				} else if (obj && String(obj) === '[object Object]') {
					for (let key of Object.keys(obj)) {
						buildParams(prefix + '[' + key + ']', obj[key]);
					}
				} else {
					add(prefix, obj);
				}
			} else {
				for (let key of Object.keys(obj)) {
					buildParams(key, obj[key]);
				}
			}
			return s;
		};

	return buildParams('', a).join('&').replace(/%20/g, '+');
};


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
				data = param(data);
			}
		}
		this.request.end(data);

		return new Promise((resolve,reject)=>{
			this.request.on('response', (response) => {
				response.on('error', (e) => {
					alert('error');
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