/**
 * Created by hkuclion on 2017/3/17.
 */
define(['Vue'], function (Vue) {
	Vue.component('tenhou-game', function (resolve, reject) {
		requirejs(['component/assistWindow/tenhou-game'], resolve);
	});

	return {
		template:`
		<div id="dispatcher">
			<tenhou-game v-if="Dispatcher.game" :TenhouGame="Dispatcher.game"></tenhou-game>
		</div>
		`,
		props:[
			'Dispatcher'
		]
	}
});