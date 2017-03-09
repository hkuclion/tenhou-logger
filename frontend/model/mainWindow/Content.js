define(['jquery','model/mainWindow/Content/PaifuList'], function ($,PaifuList) {
	let ipcRenderer = require('electron').ipcRenderer;

	class Content {
		constructor() {
			this.closed = false;
			this.content = null;
			this.type = null;
			this.createView();
		}

		createView() {
			this.$view = $('<article id="content" />');
			this.bindEvent();
		}

		bindEvent() {
			ipcRenderer.on('GET_PAIFU', (event,source) => {
				if (this.type != 'PaifuList') {
					this.createContent('PaifuList');
				}

				if(source == 'local') {
					let paifu_strings = ipcRenderer.sendSync('GET_LOCAL_PAIFU');

					this.PaifuList.setPaifu(paifu_strings);
				}
				else if(source == 'remote'){
					this.PaifuList.getRemote();
				}
			});
		}

		removeContent(){
			if(this.type)this[this.type].destructor();
			this[this.type] = null;
		}

		createContent(type){
			this.removeContent();
			this.type = type;
			switch(type){
				case 'PaifuList':
					this.createPaifuList();
					break;
			}
		}

		createPaifuList(){
			this.PaifuList = new PaifuList();
			this.$view.append(this.PaifuList.$view);
		}

		destructor(){
			this.removeContent();
			this.$view.remove();
		}
	}

	return Content;
});