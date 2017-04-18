/**
 * Created by hkuclion on 2017/4/17.
 */
define(['Vue', 'component/assistWindow/hai-methods'], function (Vue,HaiMethods) {
	return {
		template:`
		<div class="suggestion mo-suggestion">
			<div class="suggestion-syanten">听牌</div>
			听 <span class="hai" v-for="hai in suggestion.data">
				 {{displayHai(hai)}}  
			</span> 共{{suggestion.count}}枚
		</div>
		`,
		props:[
			'suggestion'
		],
		methods:HaiMethods
	}
});