/**
 * Created by hkuclion on 2017/4/17.
 */
define(['Vue'], function (Vue) {
	return {
		template:`
		<div class="suggestion syanten-suggestion">
			<div class="suggestion-syanten">
				<template v-if="suggestion.syanten == -1">和了</template>
				<template v-else-if="suggestion.syanten == 0">听牌</template>
				<template v-else>{{suggestion.syanten}}</template>
			</div>
		</div>
		`,
		props:[
			'suggestion'
		]
	}
});