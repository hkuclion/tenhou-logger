/**
 * Created by hkuclion on 2017/3/17.
 */
define(['class/Setting'],function(Setting){
	let ipcRenderer = require('electron').ipcRenderer;

	return class MainFrame{
		get componentName(){
			return 'main-frame';
		}

		constructor(){
			this.content = null;
			this.paifu_edit_mode = Setting.get('paifu_edit_mode');

			this.bindEvent();
		}

		bindEvent(){
			ipcRenderer.on('GET_PAIFU', (event, source) => {
				requirejs(['class/mainWindow/PaifuList'], (PaifuList) => {
					if (!(this.content instanceof PaifuList)) {
						this.content = new PaifuList();
						this.content.edit_mode = this.paifu_edit_mode;
					}

					if (source == 'local') {
						this.content.getLocal();
					}
					else if (source == 'remote') {
						this.content.getRemote();
					}
				});
			});

			ipcRenderer.on('PAIFU_EDIT_MODE', (event,mode) => {
				this.paifu_edit_mode = mode;
				requirejs(['class/mainWindow/PaifuList'], (PaifuList) => {
					if (this.content instanceof PaifuList) {
						this.content.edit_mode = this.paifu_edit_mode;
					}
				});
			});
		}
	}
});