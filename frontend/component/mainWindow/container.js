/**
 * Created by hkuclion on 2017/3/17.
 */
define(['Vue'],function(Vue){
	Vue.component('main-frame', function (resolve, reject) {
		requirejs(['component/mainWindow/main-frame'], resolve);
	});

	Vue.component('side-frame', function (resolve, reject) {
		requirejs(['component/mainWindow/side-frame'], resolve);
	});

	return {
		template:`
		<div id="container">
			<main-frame v-if="container.mainFrame" v-bind:mainFrame="container.mainFrame"></main-frame>
			<side-frame v-if="container.sideFrame" v-bind:sideFrame="container.sideFrame"></side-frame>
		</div>
		`,
		props:[
			'container'
		]
	}
});