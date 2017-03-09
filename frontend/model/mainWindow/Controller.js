define(['jquery','model/AsyncReady','model/mainWindow/Side','model/mainWindow/Content', 'lib/hkuc/dialog'],function ($, AsyncReady,Side,Content,HKUC) {
	let ipcRenderer = require('electron').ipcRenderer;

	return class Controller extends AsyncReady{
		constructor() {
			super();
			this.createView();
			this.createContent();
			this.createSide();

			this.ready.then(()=>{
				this.$view.appendTo('body');
			})
		}

		createView(){
			this.$view = $('<div id="controller" />');
			this.bindEvent();
		}

		bindEvent() {
			ipcRenderer.on('SHOW_MESSAGE', (event, message) => {
				HKUC.dialog.alert({
					id:'show_message',
					content:message,
				})
			});
		}

		createSide(){
			this.side = new Side();
			this.addTask(this.side.ready.then(()=>{
				this.$view.append(this.side.$view);
			}));
		}

		createContent() {
			this.content = new Content();
			this.$view.append(this.content.$view);
		}
	};
});
