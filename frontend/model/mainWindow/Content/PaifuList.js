define(['jquery','model/mainWindow/Content/Paifu','jqueryui'],function ($,Paifu) {
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
			this.bindEvent();
			this.buildContextMenu();
		}

		createView() {
			this.$view = $('<div id="paifu_list"></div>');
			this.$list = $('<ul/>').appendTo(this.$view);
		}

		bindEvent(){
			this.$list.on('contextmenu','li',(ev)=>{
				this.showContextMenu(ev);

				return false;
			});

			this.$list.selectable({
				appendTo:this.$view,
				cancel:'span',
				classes:{
					"ui-selected":"selected",
					"ui-selecting":"active",
				},
				distance:10,
			});

			this.$list.on('click','>li',function(ev){
				if(ev.ctrlKey) {
					$(this).toggleClass('selected ui-selected');
				}
				else{
					$(this).addClass('selected ui-selected').siblings().removeClass('selected ui-selected');
				}

				return false;
			});
			this.$list.on('click',function(){
				$(this).children('li').removeClass('selected ui-selected');
			})
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
				/*let selection = getSelection();
				this.contextmenu_items['copy'].visible = !selection.isCollapsed;*/

				let $selected = this.$list.children('.selected');
				this.contextmenu_items['copy_paifu'].visible=!!$selected.length;

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

		destructor(){
			for(let paifu of this.paifus){
				paifu.destructor();
			}
			this.$view.remove();
		}
	}

	return PaifuList;
});

