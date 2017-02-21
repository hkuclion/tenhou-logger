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
			ipcRenderer.on('SHOW_PAIFU_LOCAL', (event, paifu_strings) => {
				this.showPaifuList(paifu_strings,true);
			})
		}

		removeContent(){
			if(this.type)this[this.type].destructor();
		}

		showPaifuList(paifu_strings,is_local){
			this.removeContent();
			this.type = 'paifu_list';
			this.createPaifuList();
			this.paifu_list.setPaifu(
				paifu_strings.filter((value) => value.length),
				is_local
			)
		}

		createPaifuList(){
			this.paifu_list = new PaifuList();
			this.$view.append(this.paifu_list.$view);
		}

		destructor(){
			this.removeContent();
			this.$view.remove();
		}
	}

	return Content;
});