/**
 * Created by hkuclion on 2017/3/17.
 */
define(function(){
	let ipcRenderer = require('electron').ipcRenderer;

	return class MainFrame{
		get componentName(){
			return 'main-frame';
		}

		constructor(){
			this.content = null;

			this.bindEvent();
		}

		bindEvent(){
			ipcRenderer.on('GET_PAIFU', (event, source) => {
				requirejs(['class/mainWindow/PaifuList'], (PaifuList) => {
					if (!(this.content instanceof PaifuList)) {
						this.content = new PaifuList();
					}

					if (source == 'local') {
						this.content.getLocal();
					}
					else if (source == 'remote') {
						this.content.getRemote();
					}
				});
			});
		}
	}
});