/**
 * Created by hkuclion on 2017/4/17.
 */
define(['Vue','component/assistWindow/hai-methods'], function (Vue, HaiMethods) {
	Vue.component('syanten-suggestion', function (resolve, reject) {
		requirejs(['component/assistWindow/suggestion/syanten-suggestion'], resolve);
	});
	Vue.component('da-suggestion', function (resolve, reject) {
		requirejs(['component/assistWindow/suggestion/da-suggestion'], resolve);
	});
	Vue.component('mo-suggestion', function (resolve, reject) {
		requirejs(['component/assistWindow/suggestion/mo-suggestion'], resolve);
	});
	Vue.component('naki-suggestion', function (resolve, reject) {
		requirejs(['component/assistWindow/suggestion/naki-suggestion'], resolve);
	});
	Vue.component('ten-suggestion', function (resolve, reject) {
		requirejs(['component/assistWindow/suggestion/ten-suggestion'], resolve);
	});

	return {
		template:`
		<div id="tenhou-kyoku">
			<div id="kyoku-info">{{TenhouKyoku.stringKyoku}} 自风:{{TenhouKyoku.stringOya}}</div>
			<div id="kyoku-tehai">
				<span class="hai" v-for="(hai,index) in TenhouKyoku.tehais">{{displayHaiValue(hai)}}{{TenhouKyoku.tehais.length%3==2 && index == TenhouKyoku.tehais.length-2?'　|　':''}}</span>
			</div>
			<component v-if="TenhouKyoku.suggestion" v-bind:suggestion="TenhouKyoku.suggestion" v-bind:is="TenhouKyoku.suggestion.componentName"></component>
		</div>
		`,
		props:[
			'TenhouKyoku'
		],
		methods:HaiMethods
	}
});