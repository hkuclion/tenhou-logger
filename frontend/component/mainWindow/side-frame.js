/**
 * Created by hkuclion on 2017/3/17.
 */
define(['Vue'], function (Vue) {
	Vue.component('user-info', function (resolve, reject) {
		requirejs(['component/mainWindow/user-info'], resolve);
	});

	return {
		template:`
		<aside id="side" v-bind:class="{ closed:sideFrame.closed }">
			<user-info v-if="sideFrame.userInfo" v-bind:userInfo="sideFrame.userInfo"></user-info>
			<a id="side_toggle" @click="toggleSide">
				<i class="fa" v-bind:class="{ 'fa-dedent': sideFrame.closed, 'fa-indent': !sideFrame.closed }"></i>
			</a>
		</aside>
		`,
		props:[
			'sideFrame'
		],
		methods:{
			toggleSide:function(){
				this.sideFrame.toggle();
			}
		}
	}
});