/**
 * Created by hkuclion on 2017/4/17.
 */
define(['Vue', 'component/assistWindow/hai-methods'], function (Vue,HaiMethods) {
	return {
		template:`
		<div class="suggestion naki-suggestion">
			<div v-for="naki in suggestion.data">
				<span class="hai" v-for="hai_value in naki.hai_values">{{displayHaiValue(hai_value)}}</span>
				<template v-if="naki.type == 'CHI'">吃</template>
				<template v-else-if="naki.type == 'PON'">碰</template>
				<template v-else-if="naki.type == 'KAN'">杠</template>
				<span class="hai">{{displayHaiValue(naki.hai_value)}}</span>
				<component v-bind:suggestion="naki.data" v-bind:is="naki.data.componentName"></component>
			</div>
		</div>
		`,
		props:[
			'suggestion'
		],
		data:function () {
			return {
				console:console
			};
		},
		methods:HaiMethods,
	}
});