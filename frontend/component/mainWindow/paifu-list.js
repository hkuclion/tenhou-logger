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


	return {
		template:`
		<div class="paifu-list">
			<ul v-if="content.paifus && content.paifus.length">
				<paifu @selected="paifuSelected" v-for="(paifu,index) in content.paifus" :key="paifu.file" :paifu="paifu" :index="index"></paifu>
			</ul>
			<pager v-if="content.page" v-on:page="requestPage" :page="content.page"></pager>
		</div>
		`,
		props:[
			'content'
		],
		methods:{
			paifuSelected:function (index,shiftKey,ctrlKey) {
				console.log('paifuSelected', index, shiftKey, ctrlKey);
			},
			requestPage:function(page){
				this.content.setPage(page);
			}
		}
	}
});