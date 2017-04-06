/**
 * Created by hkuclion on 2017/3/17.
 */
define(['class/mainWindow/Paifu','class/Setting','class/SerialCall','lib/hkuc/dialog','lib/Base64/Base64'],function(Paifu,Setting, SerialCall,HKUCDialog, Base64){
	const electron = require('electron');
	const {Menu}=electron.remote;
	const {clipboard, ipcRenderer} = electron;

	const default_search={
		start_date:null,
		end_date:null,
		player:null,
		toplayer:null,
		rank:null,
		comment:null,
		lobby:null,
		type:null
	};

	return class PaifuList{
		get componentName(){
			return "paifu-list";
		}

		constructor(){
			this.paifus=[];
			this.source=null;
			this.page = null;
			this.search = null;
			this.edit_mode=false;

			this.contextmenu = null;
			this.contextmenu_items = {};

			this.last_selected_paifu_index = -1;
			this.last_ctrl_shift_index = -1;
		}

		setPage(page){
			if(arguments.length) {
				if (!page || page < 1) page = 1;

				if (page == this.page.page)return false;
				this.page.page = page;
			}
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
				},
				{
					label:'重放选中牌谱',
					id:'review_paifu',
					click:() => {
						this.reviewSelectedPaifu();
					}
				},
				{
					id:'edit_separator',
					type:'separator',
					enabled:false,
					visible:false,
				},
				{
					label:'编辑注释',
					id:'edit_comment',
					click:() => {
						this.editPaifuComment();
					}
				},
				{
					label:'删除注释',
					id:'delete_comment',
					click:() => {
						this.deletePaifuComment();
					}
				},
				{
					label:'添加注释',
					id:'add_comment',
					click:() => {
						this.addPaifuComment();
					}
				},
				{
					label:'修正牌谱',
					id:'correct_paifu',
					click:() => {
						this.addPaifuJson();
					}
				},
				{
					type:'separator',
				},
				{
					label:'重新读取列表',
					id:'reload',
					click:() => {
						this.reload();
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

				let selectedPaifus = this.getSelectedPaifus();

				this.contextmenu_items['copy_paifu'].visible = !!selectedPaifus.length;
				this.contextmenu_items['upload_paifu'].visible = !!selectedPaifus.length && this.source=='local';
				this.contextmenu_items['review_paifu'].visible = selectedPaifus.length == 1;

				this.contextmenu_items['delete_comment'].visible =
				this.contextmenu_items['edit_comment'].visible = !!(this.source == 'remote' && this.edit_mode === true && selectedPaifus.length == 1 && selectedPaifus[0].tcomment_id);
				this.contextmenu_items['add_comment'].visible = this.source == 'remote' && this.edit_mode===true && selectedPaifus.length == 1 && !selectedPaifus[0].tcomment_id;
				this.contextmenu_items['correct_paifu'].visible = this.source == 'remote' && this.edit_mode === true && selectedPaifus.filter(paifu=>paifu.rank==0).length>0;

				this.contextmenu_items['edit_separator'].visible =
					this.contextmenu_items['delete_comment'].visible ||
					this.contextmenu_items['edit_comment'].visible ||
					this.contextmenu_items['add_comment'].visible ||
					this.contextmenu_items['correct_paifu'].visible;

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

		reviewSelectedPaifu(){
			this.getSelectedPaifus().shift().review();
		}

		async uploadSelectedPaifu() {
			let logstrs = [];
			for (let paifu of this.getSelectedPaifus()) {
				logstrs.push(paifu.toString('logstr'));
			}
			logstrs = logstrs.reverse();
			let recent_results = [];
			let success_count = 0;
			let cancel_flag = false;

			let info_dialog = HKUCDialog.alert('牌谱上传中，请稍候', {
				modal:true,
				buttons:[
					{
						'text':'取消',
						'click':function () {
							HKUCDialog.confirm('确定要取消牌谱上传吗？')
								.on('ok',(ev)=>{
									cancel_flag=true;
								});
						},
					},
				],
			});

			for (let i = 0; i < logstrs.length; i++) {
				recent_results.push(`正在上传第 ${i + 1}/${logstrs.length} 条牌谱…`);
				if (recent_results.length > 5) recent_results.shift();
				info_dialog.option('content', '牌谱上传中，请稍候<br />' + recent_results.join('<br />'));
				let result = await SerialCall.call('ajax', {
					url:`${Setting.get('server')}/Tlog/ajax_set.html`,
					method:'POST',
					data:{logstr:Base64.encode(logstrs[i])},
				});

				if(result.result == 'login'){
					HKUCDialog.alert(`请登录`).on('close', () => {
						info_dialog.close();
					});
					return;
				}

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

				if (cancel_flag)break;
			}

			HKUCDialog.alert(`牌谱上传完毕，成功上传了${success_count}/${logstrs.length}条牌谱`).on('close', () => {
				info_dialog.close();
			});
		}

		getSelectedPaifus(){
			return this.paifus.filter(paifu=>paifu.selected);
		}

		addPaifuComment(){
			let paifu = this.getSelectedPaifus().shift();
			let paifu_comment_dialog = HKUCDialog.prompt(
				'', {
					title:'添加注释',
					id:'paifu_comment',
					multiline:true,
					value:paifu.comment
				}
			).on('ok', async (ev, value) => {
				let info_dialog = HKUCDialog.alert('提交数据中，请稍候', {modal:true, persist:true});
				let result = await SerialCall.call('ajax', {
					url:`${Setting.get('server')}/Tlog/ajax_comment_add.html`,
					method:'POST',
					data:{log_id:paifu.id, comment:Base64.encode(encodeURIComponent(value))},
				});

				if (result.result == 'success') {
					info_dialog.close();
					paifu_comment_dialog.close();
					paifu.setData({
						tcomment_id:result.data,
						comment:value
					});
					HKUCDialog.alert(result.message);
				}
				else {
					info_dialog.close();
					HKUCDialog.alert(result.message);
				}

				return false;
			});
		}

		editPaifuComment(){
			let paifu = this.getSelectedPaifus().shift();
			let paifu_comment_dialog = HKUCDialog.prompt(
				'',{
					title:'编辑注释',
					id:'paifu_comment',
					multiline:true,
					value:paifu.comment
				}
			).on('ok',async (ev,value)=>{
				let info_dialog = HKUCDialog.alert('提交数据中，请稍候', {modal:true, persist:true});
				let result = await SerialCall.call('ajax', {
					url:`${Setting.get('server')}/Tlog/ajax_comment_edit.html`,
					method:'POST',
					data:{log_id:paifu.id,comment:Base64.encode(encodeURIComponent(value))},
				});

				if (result.result == 'success') {
					info_dialog.close();
					paifu_comment_dialog.close();
					paifu.setData({
						comment:value
					});
					HKUCDialog.alert(result.message);
				}
				else{
					info_dialog.close();
					HKUCDialog.alert(result.message);
				}

				return false;
			});
		}

		deletePaifuComment(){
			let paifu = this.getSelectedPaifus().shift();
			let confirm_dialog = HKUCDialog.confirm('真的要删除该注释吗？')
				.on('ok', async (ev)=>{
					let info_dialog = HKUCDialog.alert('提交数据中，请稍候', {modal:true, persist:true});
					let result = await SerialCall.call('ajax', {
						url:`${Setting.get('server')}/Tlog/ajax_comment_delete.html`,
						method:'POST',
						data:{log_id:paifu.id},
					});

					if (result.result == 'success') {
						info_dialog.close();
						paifu.setData({
							tcomment_id:0,
							comment:null
						});
						HKUCDialog.alert(result.message);
					}
					else {
						info_dialog.close();
						HKUCDialog.alert(result.message);
					}
				});
		}

		async addPaifuJson(){
			let paifus = this.getSelectedPaifus().filter(paifu => paifu.rank == 0);

			let recent_results = [];
			let success_count = 0;
			let cancel_flag = false;

			let info_dialog = HKUCDialog.alert('牌谱修正中，请稍候', {
				modal:true,
				buttons:[
					{
						'text':'取消',
						'click':function () {
							HKUCDialog.confirm('确定要取消牌谱上传吗？')
								.on('ok', (ev) => {
									cancel_flag = true;
								});
						},
					},
				]
			});

			for (let i = 0; i < paifus.length; i++) {
				recent_results.push(`正在获取第 ${i + 1}/${paifus.length} 条牌谱的数据…`);
				if (recent_results.length > 5) recent_results.shift();
				info_dialog.option('content', '牌谱修正中，请稍候<br />' + recent_results.join('<br />'));
				let json = await SerialCall.call('ajax', {
					url:`http://tenhou.net/5/mjlog2json.cgi?${paifus[i].file}`,
					method:'GET',
					referer:paifus[i].url,
					dataType:'text',
				});
				let last_result = recent_results.pop();

				if (json) {
					last_result = `第 ${i + 1}/${paifus.length} 条牌谱获取数据成功，正在提交数据…`;
				}
				else {
					last_result = `第 ${i + 1}/${paifus.length} 条牌谱获取数据失败`;
				}
				recent_results.push(last_result);
				info_dialog.option('content', '牌谱修正中，请稍候<br />' + recent_results.join('<br />'));

				if(!json)continue;

				let result = await SerialCall.call('ajax', {
					url:`${Setting.get('server')}/Tlog/ajax_json_add.html`,
					method:'POST',
					data:{
						log_id:paifus[i].id,
						json:Base64.encode(encodeURIComponent(JSON.stringify(eval('(' + json + ')')))),
						correct:true,
					},
				});

				if (result.result == 'login') {
					HKUCDialog.alert(`请登录`).on('close', () => {
						info_dialog.close();
					});
					return;
				}

				last_result = recent_results.pop();

				if (result.result == 'success') {
					success_count += 1;
					last_result += '成功';
					paifus[i].setData(result.data.Tlog);
				}
				else {
					last_result += `失败:${result.data}`;
				}

				recent_results.push(last_result);
				info_dialog.option('content', '牌谱修正中，请稍候<br />' + recent_results.join('<br />'));

				if(cancel_flag)break;
			}

			HKUCDialog.alert(`牌谱修正中完毕，成功修正了${success_count}/${paifus.length}条牌谱`).on('close', () => {
				info_dialog.close();
			});
		}

		getLocal(){
			this.source = 'local';
			let log_strs = ipcRenderer.sendSync('GET_LOCAL_PAIFU');

			let paifus = [];
			for(let log_str of log_strs){
				let paifu = Paifu.fromLogStr(log_str);
				if(!this.localMatch(paifu))continue;

				paifus.push(paifu);
			}

			this.paifus = paifus;
			this.page = null;
			this.search = Object.assign({},default_search,this.search);
		}

		localMatch(paifu){
			if(!this.search)return true;
			if(this.search.start_date && this.search.start_date > paifu.date){
				return false;
			}
			if (this.search.end_date && this.search.end_date < paifu.date) {
				return false;
			}
			if(this.search.lobby && parseInt(this.search.lobby) !== paifu.lobby){
				return false;
			}
			if(this.search.player && !this.search.player.split(' ').includes(paifu.un[0])){
				return false;
			}
			if(this.search.toplayer && ![paifu.un[1],paifu.un[2],paifu.un[3]].includes(this.search.toplayer)){
				return false;
			}
			if (this.search.rank && !this.search.rank.split(' ').map(x=>parseInt(x)).includes(paifu.rank)) {
				return false;
			}
			if(this.search.type){
				for(let key of Object.keys(this.search.type)){
					if(!this.search.type[key].includes(paifu['type_'+key])){
						return false;
					}
				}
			}

			return true;
		}

		async getRemote(){
			this.source = 'remote';

			let dialog = HKUCDialog.alert('获取远程数据中……');

			let data = this.search ? this.search : {};

			let post_data = {};
			for(let key in default_search){
				if(data[key])post_data[key]=data[key];
			}

			let result = await SerialCall.call('ajax', {
				url:`${Setting.get('server')}/Tlog/ajax_get`,
				method:'POST',
				data:Object.assign(post_data, {page:this.page ? this.page.page : 1})
			});

			dialog.close();

			if (result.result == 'success') {
				let paifus = [];
				for(let item of result.data.list){
					paifus.push(new Paifu(Object.assign(item.Tlog,{comment:item.Tcomment? item.Tcomment.content:null})));
				}
				this.paifus = paifus;

				if(this.page){
					this.page.page = result.data.page.Tlog.page;
				}

				this.page = result.data.page.Tlog;

				this.search = Object.assign({}, default_search,result.data.search);
			}
			else {
				HKUCDialog.alert(result.message);
			}
		}

		reload(){
			switch(this.source){
				case 'remote':
					this.getRemote();
					break;
				case 'local':
					this.getLocal();
					break;
			}
		}
	}
});