/**
 * Created by hkuclion on 2017/3/17.
 */
define(['class/mainWindow/Paifu','class/Setting','class/SerialCall','lib/hkuc/dialog'],function(Paifu,Setting, SerialCall,HKUCDialog){
	const electron = require('electron');
	const {Menu}=electron.remote;
	const {clipboard, ipcRenderer} = electron;

	return class PaifuList{
		get componentName(){
			return "paifu-list";
		}

		constructor(){
			this.paifus=[];
			this.page = null;
			this.search = {};

			this.contextmenu = null;
			this.contextmenu_items = {};

			this.last_selected_paifu_index = -1;
			this.last_ctrl_shift_index = -1;
		}

		setPage(page){
			this.page.page=page;
			return this.getRemote();
		}

		paifuSelected(index, shiftKey, ctrlKey){
			if(!shiftKey || !this.last_selected_paifu_index == -1){
				this.last_selected_paifu_index = index;
			}

			if(!shiftKey && !ctrlKey){
				for (let i = 0; i < this.paifus.length; i++) {
					this.paifus[i].selected = i == index;
				}
			}
			else if(!shiftKey && ctrlKey){
				this.paifus[index].selected = !this.paifus[index].selected;
			}
			else if(shiftKey && !ctrlKey){
				let max = Math.max(index, this.last_selected_paifu_index);
				let min = Math.min(index, this.last_selected_paifu_index);
				for (let i = 0; i < this.paifus.length; i++) {
					this.paifus[i].selected = i >= min && i <= max;
				}
			}
			else if(shiftKey && ctrlKey){
				if(this.last_ctrl_shift_index == -1){
					this.last_ctrl_shift_index = index;
					this.paifus[index].selected = !this.paifus[index].selected;
				}
				else{
					let max = Math.max(index, this.last_ctrl_shift_index);
					let min = Math.min(index, this.last_ctrl_shift_index);

					for (let i = min; i <= max; i++) {
						this.paifus[i].selected = this.paifus[this.last_ctrl_shift_index].selected;
					}
					this.last_ctrl_shift_index = -1;
				}
			}
		}

		buildContextMenu() {
			let menu_template = [
				{
					label:'复制选中文字',
					role:'copy',
					id:'copy'
				},
				{
					label:'复制选中牌谱',
					id:'copy_paifu',
					click:() => {
						this.copySelectedPaifu();
					}
				},
				{
					label:'上传选中牌谱',
					id:'upload_paifu',
					click:() => {
						this.uploadSelectedPaifu();
					}
				}
			];

			this.contextmenu = Menu.buildFromTemplate(menu_template);

			for (let menu_item of this.contextmenu.items) {
				if (menu_item.id) {
					this.contextmenu_items[menu_item.id] = menu_item;
				}
			}
		}

		showContextMenu(ev){
			if (this.paifus.length) {
				if(!this.contextmenu){
					this.buildContextMenu();
				}

				this.contextmenu_items['copy_paifu'].visible =
					this.contextmenu_items['upload_paifu'].visible = !!this.getSelectedPaifus().length;

				this.contextmenu.popup(
					ev.pageX,
					ev.pageY
				);
			}
		}

		copySelectedPaifu() {
			let paifuTexts = [];
			for (let paifu of this.getSelectedPaifus()) {
				paifuTexts.push(paifu.toString());
			}

			clipboard.writeText(paifuTexts.join('\n'));
		}

		async uploadSelectedPaifu() {
			let logstrs = [];
			for (let paifu of this.getSelectedPaifus()) {
				logstrs.push(paifu.toString('logstr'));
			}
			logstrs = logstrs.reverse();

			let info_dialog = HKUCDialog.alert('牌谱上传中，请稍候', {modal:true, persist:true});
			let recent_results = [];
			let success_count = 0;

			for (let i = 0; i < logstrs.length; i++) {
				recent_results.push(`正在上传第 ${i + 1}/${logstrs.length} 条牌谱…`);
				if (recent_results.length > 5) recent_results.shift();
				info_dialog.option('content', '牌谱上传中，请稍候<br />' + recent_results.join('<br />'));
				let result = await SerialCall.call('ajax', {
					url:`${Setting.get('server')}/Tlog/ajax_set.html`,
					method:'POST',
					data:{logstr:btoa(logstrs[i])},
				});
				let last_result = recent_results.pop();

				if (result.result == 'success') {
					success_count += 1;
					last_result += '成功';
				}
				else {
					last_result += `失败:${result.data}`;
				}
				recent_results.push(last_result);
				info_dialog.option('content', '牌谱上传中，请稍候<br />' + recent_results.join('<br />'));
			}

			HKUCDialog.alert(`牌谱上传完毕，成功上传了${success_count}/${logstrs.length}条牌谱`).on('close', () => {
				info_dialog.close();
			});
		}

		getSelectedPaifus(){
			return this.paifus.filter(paifu=>paifu.selected);
		}

		getLocal(){
			let log_strs = ipcRenderer.sendSync('GET_LOCAL_PAIFU');

			let paifus = [];
			for(let log_str of log_strs){
				paifus.push(Paifu.fromLogStr(log_str));
			}

			this.paifus = paifus;
			this.page = null;
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