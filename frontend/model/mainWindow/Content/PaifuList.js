define(['jquery','model/mainWindow/Content/Paifu','model/Setting','model/SerialCall','lib/hkuc/dialog','lib/layPage/laypage'],function ($,Paifu,Setting,SerialCall,HKUCDialog,layPage) {
	let electron = require('electron');
	let {Menu}=electron.remote;
	let clipboard = electron.clipboard;

	class PaifuList {
		constructor() {
			this.paifus = [];
			this.page = 1;
			this.search = {};

			this.is_local=true;
			this.contextmenu = null;
			this.contextmenu_items = {};
			this.createView();
			this.buildContextMenu();
		}

		createView() {
			this.$view = $('<div id="paifu_list"></div>');
			this.$list = $('<ul/>').appendTo(this.$view);
			this.$page = $('<div/>').appendTo(this.$view);

			this.bindEvent();
		}

		bindEvent(){
			this.$list.on('contextmenu','li',(ev)=>{
				this.showContextMenu(ev);

				return false;
			});

			this.$list.on('click','>li',function(ev){
				let $this = $(this);
				if(ev.ctrlKey) {
					$this.toggleClass('selected ui-selected');
				}
				else{
					$this.addClass('selected ui-selected').siblings().removeClass('selected ui-selected');
				}

				if(!ev.shiftKey){
					$this.addClass('latest').siblings().removeClass('latest');
				}
				else{
					let $all = $this.siblings().addBack();
					let latest_index = $all.filter('.latest').index();
					if(latest_index == -1){
						$this.addClass('latest');
					}
					else{
						let current_index = $this.index();
						$all.slice(Math.min(latest_index,current_index),Math.max(latest_index,current_index)).addClass('selected ui-selected')
					}
				}

				return false;
			});

			this.shiftKey = false;
			$(window).on('keydown.paifu_list',(ev)=>{
				this.onKeyDown(ev);
			});

			this.$list.on('selectstart', (ev)=>{
				if(this.shiftKey) {
					ev.preventDefault();
				}
			});
			this.$list.on('click',function(){
				$(this).children('li').removeClass('selected ui-selected');
			})
		}

		onKeyDown(ev){
			if (ev.keyCode == 16) {
				this.shiftKey = true;
				$(window).off('keydown.paifu_list');
				$(window).on('keyup.paifu_list', (ev) => {
					return this.onKeyUp(ev);
				});
			}
		}
		onKeyUp(ev){
			if (ev.keyCode == 16) {
				this.shiftKey = false;
				$(window).off('keyup.paifu_list');
				$(window).on('keydown.paifu_list', (ev) => {
					return this.onKeyDown(ev);
				});
			}
		}

		setPaifu(paifu_strings,page,search){
			this.paifus = [];
			this.$list.empty();

			for(let paifu_string of paifu_strings){
				let paifu = new Paifu(paifu_string);
				this.paifus.push(paifu);
				this.$list.append(paifu.$view);
			}

			if(page){
				layPage.dir = './lib/layPage/laypage.css';
				layPage({
					cont:this.$page,
					pages:page.Tlog.pageCount,
					curr:page.Tlog.page,
					first:'首页',
					last:'尾页',
					jump:async (page_info,first)=>{
						if(!first){
							this.page = page_info.curr;
							this.getRemote();
						}
					}
				})
			}
			else{
				this.$page.empty();
			}
		}

		buildContextMenu(){
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
					click:()=>{
						this.uploadSelectedPaifu();
					}
				}
			];

			this.contextmenu = Menu.buildFromTemplate(menu_template);

			for (let menu_item of this.contextmenu.items) {
				if(menu_item.id) {
					this.contextmenu_items[menu_item.id] = menu_item;
				}
			}
		}

		showContextMenu(ev){
			if (this.paifus.length) {
				let $selected = this.$list.children('.selected');
				this.contextmenu_items['copy_paifu'].visible=
				this.contextmenu_items['upload_paifu'].visible =
					!!$selected.length;

				this.contextmenu.popup(
					ev.pageX,
					ev.pageY
				);
			}
		}

		copySelectedPaifu(){
			let $selected = this.$list.children('.selected');
			let indexes = [];
			$selected.each((index,obj)=>{
				indexes.push($(obj).index());
			});

			let paifuTexts = [];
			for(let index of indexes){
				paifuTexts.push(this.paifus[index].toString());
			}

			clipboard.writeText(paifuTexts.join('\n'));
		}

		async uploadSelectedPaifu(){
			let $selected = this.$list.children('.selected');
			let indexes = [];
			$selected.each((index, obj) => {
				indexes.push($(obj).index());
			});

			let logstrs=[];
			for (let index of indexes) {
				logstrs.push(this.paifus[index].toString('logstr'));
			}
			logstrs= logstrs.reverse();

			let info_dialog = HKUCDialog.alert('牌谱上传中，请稍候',{ modal:true,persist:true });
			let recent_results = [];
			let success_count = 0;

			for(let i=0; i<logstrs.length; i++){
				recent_results.push(`正在上传第 ${i + 1}/${logstrs.length} 条牌谱…`);
				if(recent_results.length>5)recent_results.shift();
				info_dialog.option('content', '牌谱上传中，请稍候<br />' + recent_results.join('<br />'));
				let result = await SerialCall.call('ajax', {
					url:`${Setting.get('server')}/Tlog/ajax_set.html`,
					method:'POST',
					data:{logstr:btoa(logstrs[i])},
				});
				let last_result= recent_results.pop();

				if(result.result == 'success'){
					success_count+=1;
					last_result += '成功';
				}
				else{
					last_result += `失败:${result.data}`;
				}
				recent_results.push(last_result);
				info_dialog.option('content', '牌谱上传中，请稍候<br />'+ recent_results.join('<br />'));
			}

			HKUCDialog.alert(`牌谱上传完毕，成功上传了${success_count}/${logstrs.length}条牌谱`).on('close',()=>{
				info_dialog.close();
			});
		}

		async getRemote(){
			let dialog = HKUCDialog.alert('获取远程数据中……');

			let result = await SerialCall.call('ajax',{
				url:`${Setting.get('server')}/Tlog/ajax_get`,
				method:'POST',
				data:Object.assign(
					{page:this.page},this.search
				)
			});

			dialog.close();

			if (result.result == 'success') {
				this.setPaifu(result.data.list,result.data.page,result.data.search);
			}
			else {
				HKUCDialog.alert(result.message);
			}
		}

		destructor(){
			for(let paifu of this.paifus){
				paifu.destructor();
			}
			this.$view.remove();
			$(window).off('keyup.paifu_list');
			$(window).off('keydown.paifu_list');
		}
	}

	return PaifuList;
});

