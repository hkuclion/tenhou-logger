/**
 * Created by hkuclion on 2017/4/17.
 */
define(['Vue'], function (Vue) {
	return {
		template:`
		<div class="suggestion syanten-suggestion">
			<div class="suggestion-syanten">{{suggestion.syanten}}</div>
		</div>
		`,
		props:[
			'suggestion'
		]
	}
});