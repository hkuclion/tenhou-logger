/**
 * Created by hkuclion on 2017/3/17.
 */
define(['Vue'], function (Vue) {
	Vue.component('paifu-list', function (resolve, reject) {
		requirejs(['component/mainWindow/paifu-list'], resolve);
	});

	return {
		template:`
		<article id="main">
			<component v-if="mainFrame.content" v-bind:content="mainFrame.content" v-bind:is="mainFrame.content.componentName"></component>
		</article>
		`,
		props:[
			'mainFrame'
		]
	}
});