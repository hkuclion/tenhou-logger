/**
 * Created by hkuclion on 2017/3/17.
 */
define(['class/mainWindow/Paifu','class/Setting','class/SerialCall','lib/hkuc/dialog'],function(Paifu,Setting, SerialCall,HKUCDialog){
	let ipcRenderer = require('electron').ipcRenderer;

	return class PaifuList{
		get componentName(){
			return "paifu-list";
		}

		constructor(){
			this.paifus=[];
			this.page = null;
			this.search = {};
		}

		setPage(page){
			this.page.page=page;
			return this.getRemote();
		}

		getLocal(){
			let log_strs = ipcRenderer.sendSync('GET_LOCAL_PAIFU');

			let paifus = [];
			for(let log_str of log_strs){
				paifus.push(Paifu.fromLogStr(log_str));
			}

			this.paifus = paifus;
		}

		async getRemote(){
			let dialog = HKUCDialog.alert('获取远程数据中……');

			let result = await SerialCall.call('ajax', {
				url:`${Setting.get('server')}/Tlog/ajax_get`,
				method:'POST',
				data:Object.assign(
					this.search,{page:this.page?this.page.page:1}
				)
			});

			dialog.close();

			if (result.result == 'success') {
				let paifus = [];
				for(let item of result.data.list){
					paifus.push(new Paifu(item.Tlog));
				}
				this.paifus = paifus;

				if(this.page){
					this.page.page = result.data.page.Tlog.page;
				}
				this.page = result.data.page.Tlog;
				this.search = result.data.search;
			}
			else {
				HKUCDialog.alert(result.message);
			}
		}
	}
});