const {net:Net, session:Session} = require('electron');
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

let session = Session.fromPartition('persist:tenhou-logger');

class Ajax{
	constructor(options) {
		this.options = Object.assign({}, default_options, options);
		let url_info = Url.parse(this.options.url);

		return new Promise((resolve, reject) => {
			session.cookies.get({domain:url_info.domain}, (error, cookies) => {
				this.request = Net.request(Object.assign({
					method:this.options.method,
					session,
				}, url_info));

				if(cookies.length) {
					let cookie_values = {};
					for (let cookie of cookies) {
						cookie_values[cookie.name] = cookie.value;
					}
					this.request.setHeader('Cookie', QS.stringify(cookie_values));
				}
				let data = this.options.data;
				if (data) {
					this.request.setHeader('Content-Type', this.options.contentType);
					if (this.options.contentType == default_options.contentType && typeof data != 'string') {
						data = QS.stringify(data);
					}
				}
				this.request.end(data);

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

						if (typeof this.options.statusCode[response.statusCode] == 'function') {
							this.options.statusCode[response.statusCode].call(this.options.context, responseText);
						}

						let response_data = responseText;
						if (this.options.dataType == 'json') {
							try {
								response_data = JSON.parse(response_data);
							}
							catch (e) {
								e.description = responseText;
								reject(e);
							}
						}

						resolve(response_data);
					});
				});
			});
		});
	}
}

module.exports = Ajax;