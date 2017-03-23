/**
 * Created by hkuclion on 2017/3/17.
 */
define(['Vue'], function (Vue) {
	Vue.component('paifu', function (resolve, reject) {
		requirejs(['component/mainWindow/paifu'], resolve);
	});

	Vue.component('pager', function (resolve, reject) {
		requirejs(['component/mainWindow/pager'], resolve);
	});

	Vue.component('search', function (resolve, reject) {
		requirejs(['component/mainWindow/search'], resolve);
	});

	return {
		template:`
		<div class="paifu-list">
			<ul v-if="PaifuList.paifus && PaifuList.paifus.length">
				<paifu @selected="paifuSelected" @contextmenu="contextMenu" :shiftHold="shiftHold" v-for="(paifu,index) in PaifuList.paifus" :key="paifu.file" :paifu="paifu" :index="index"></paifu>
			</ul>
			<pager v-if="PaifuList.page" v-on:page="requestPage" :page="PaifuList.page"></pager>
			<search @change="searchChanged" :search="PaifuList.search"></search>
		</div>
		`,
		props:[
			'content'
		],
		data:function(){
			return {
				shiftHold:false
			};
		},
		computed:{
			PaifuList:function(){
				return this.content;
			}
		},
		methods:{
			paifuSelected:function (index,shiftKey,ctrlKey) {
				this.shiftHold = shiftKey;
				this.PaifuList.paifuSelected(index, shiftKey, ctrlKey);
			},
			contextMenu:function(ev){
				this.PaifuList.showContextMenu(ev);
			},
			searchChanged:function(){
				this.PaifuList.setPage();
			},
			requestPage:function(page){
				this.PaifuList.setPage(page);
			}
		}
	}
});