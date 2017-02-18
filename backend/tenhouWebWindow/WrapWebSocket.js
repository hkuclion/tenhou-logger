let backupWebSocket = WebSocket;

class WrapWebSocket{
	constructor(...args){
		this.web_socket = new backupWebSocket(...args);
		this.callbacks={};
		this.bindings = {};
		this.zInterval = null;
	}

	send(data){
		return this.web_socket.send(data);
	}

	get readyState(){
		return this.web_socket.readyState;
	}

	addEventListener(eventName, callback, useCapture=false){
		switch(eventName) {
			case 'open':{
				this.callbacks.open = callback;
				this.bindings.open = (event) => {
					return this.callbacks.open.call(this,event);
				};
				this.web_socket.addEventListener(eventName, this.bindings.open, useCapture);
				break;
			}
			case 'close': {
				this.callbacks.close = callback;
				this.bindings.close = (event) => {
					return this.callbacks.close.call(this,event);
				};
				this.web_socket.addEventListener(eventName, this.bindings.close, useCapture);
				break;
			}
			case 'message': {
				this.callbacks.message = callback;
				this.bindings.message = (event) => {
					console.log('RECV',JSON.parse(event.data));
					return this.callbacks.message.call(this,event);
				};
				this.web_socket.addEventListener(eventName, this.bindings.message, useCapture);
				break;
			}
		}
	}

	removeEventListener(eventName, callback, useCapture=false) {
		switch (eventName) {
			case 'open': {
				delete this.callbacks.open;
				this.web_socket.removeEventListener(eventName, this.bindings.open, useCapture);
				break;
			}
			case 'close': {
				delete this.callbacks.close;
				this.web_socket.removeEventListener(eventName, this.bindings.close, useCapture);
				break;
			}
			case 'message': {
				delete this.callbacks.message;
				this.web_socket.removeEventListener(eventName, this.bindings.message, useCapture);
				break;
			}
		}
	}
}

WebSocket = WrapWebSocket;
