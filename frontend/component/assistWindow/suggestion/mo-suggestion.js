/**
 * Created by hkuclion on 2017/4/17.
 */
define(['Vue', 'component/assistWindow/hai-methods'], function (Vue,HaiMethods) {
	return {
		template:`
		<div class="suggestion mo-suggestion">
			{{suggestion.syanten == 0?'听':'摸'}} <span class="hai" v-for="hai in suggestion.data.hai_values">
				 {{displayHai(hai)}}  
			</span> 共{{suggestion.data.count}}枚
		</div>
		`,
		props:[
			'suggestion'
		],
		methods:HaiMethods
	}
});