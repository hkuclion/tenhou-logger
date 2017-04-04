/**
 * Created by hkuclion on 2017/3/17.
 */
define(['Vue'], function (Vue) {
	Vue.component('operation', function (resolve, reject) {
		requirejs(['component/paifuSourceConfigWindow/operation'], resolve);
	});

	Vue.component('source-list', function (resolve, reject) {
		requirejs(['component/paifuSourceConfigWindow/source-list'], resolve);
	});

	return {
		template:`
		<div id="container">
			<operation 
				@add="addSource" 
				@remove="removeSource" 
				@default="defaultSource"
				:default_index="container.default_index"
				:selected_index="container.selected_index"
				></operation>
			<source-list
				:sources="container.sources"
				:default_index="container.default_index"
				:selected_index="container.selected_index"
				@select="selectSource"
				@default="defaultSource"
				></source-list>
		</div>
		`,
		props:[
			'container'
		],
		methods:{
			addSource:function(){
				this.container.showAddSource();
			},
			removeSource:function (index) {
				this.container.removeSource(index);
			},
			defaultSource:function (index) {
				this.container.setDefaultIndex(index);
			},
			selectSource:function(index){
				this.container.selected_index= index;
			}
		}
	}
});