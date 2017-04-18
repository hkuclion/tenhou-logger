/**
 * Created by hkuclion on 2017/4/17.
 */
define(['Vue', 'component/assistWindow/hai-methods'], function (Vue,HaiMethods) {
	return {
		template:`
		<div class="suggestion da-suggestion">
			<div class="suggestion-syanten">{{suggestion.syanten}}</div>
			<div v-for="da in suggestion.data">
				打 <span class="hai">{{displayHai(da.hai_value)}}</span>
				<mo-suggestion :suggestion="da.mo"></mo-suggestion>
			</div>
		</div>
		`,
		props:[
			'suggestion'
		],
		methods:HaiMethods,
	}
});