/**
 * Created by hkuclion on 2017/4/17.
 */
define(['Vue'], function (Vue) {
	Vue.component('tenhou-kyoku', function (resolve, reject) {
		requirejs(['component/assistWindow/tenhou-kyoku'], resolve);
	});

	return {
		template:`
		<div id="tenhou-game">
			<div id="game-info">{{TenhouGame.typeString}}</div>

			<tenhou-kyoku v-if="TenhouGame.kyoku" :TenhouKyoku="TenhouGame.kyoku"></tenhou-kyoku>
		</div>
		`,
		props:[
			'TenhouGame'
		]
	}
});