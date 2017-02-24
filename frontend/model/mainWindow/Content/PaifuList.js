define(['jquery','model/mainWindow/Content/Paifu','model/SerialCall','lib/hkuc/dialog'],function ($,Paifu,SerialCall,HKUCDialog) {
	let electron = require('electron');
	let {Menu}=electron.remote;
	let clipboard = electron.clipboard;

	class PaifuList {
		constructor() {
			this.paifus = [];
			this.is_local=true;
			this.contextmenu = null;
			this.contextmenu_items = {};
			this.createView();
			this.buildContextMenu();
		}

		createView() {
			this.$view = $('<div id="paifu_list"></div>');
			this.$list = $('<ul/>').appendTo(this.$view);

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

		setPaifu(paifu_strings,is_local){
			this.paifus = [];
			this.is_local = is_local;
			this.$list.empty();

			for(let paifu_string of paifu_strings){
				let paifu = new Paifu(paifu_string, is_local);
				this.paifus.push(paifu);
				this.$list.append(paifu.$view);
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
					url:'http://local.hkuclion.com/Tlog/ajax_set.html',
					method:'POST',
					data:{logstr:btoa(logstrs[i])},
				});
				let last_result= recent_results.pop();

				if(result.result == 'success'){
					success_count+=1;
					last_result += '成功';
				}
				else{
					last_result += '失败';
				}
				recent_results.push(last_result);
				info_dialog.option('content', '牌谱上传中，请稍候<br />'+ recent_results.join('<br />'));
			}

			info_dialog.close();
			HKUCDialog.alert(`牌谱上传完毕，成功上传了${success_count}/${logstrs.length}条牌谱`);
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

