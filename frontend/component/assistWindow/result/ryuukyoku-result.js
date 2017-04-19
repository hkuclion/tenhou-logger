/**
 * Created by hkuclion on 2017/4/18.
 */
define(['Vue'], function (Vue) {
	return {
		template:`
		<div class="result ryuukyoku-result">
			<div class="result-type">流局</div>
			<div class="result-ten">
				<span class="ten" v-bind:class="{plus:result.sc[1]>0,minus:result.sc[1]<0}">{{result.sc[1]*100}}</span>
			</div>
		</div>
		`,
		props:[
			'result'
		]
	}
});