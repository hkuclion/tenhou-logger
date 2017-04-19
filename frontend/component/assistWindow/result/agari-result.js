/**
 * Created by hkuclion on 2017/4/18.
 */
define(['Vue', 'component/assistWindow/hai-methods'], function (Vue, HaiMethods) {
	return {
		template:`
		<div class="result ryuukyoku-result">
			<div class="result-type">
				{{['本家','下家','对家','上家'][result.who]}}
				<template v-if="result.who===result.fromWho">自摸</template>
				<template v-else="result.who===result.fromWho"> 和了 {{['本家','下家','对家','上家'][result.fromWho]}}</template>
				<span class="hai">{{displayHai(result.hai)}}</span>
			</div>
			<div class="result-ten">
				<span class="ten" v-bind:class="{plus:result.sc[1]>0,minus:result.sc[1]<0}">{{result.sc[1]*100}}</span>
			</div>
			<ul class="result-yaku">
				<li v-for="[yaku,count] in [...result.yaku]"><label>{{displayYaku(yaku)}}</label> {{count}}翻</li>
			</ul>
			<div class="yaku-han">
				<template v-if="result.yakuman"><label>役满</label> {{result.ten[1]}}点</template>
				<template v-else-if="result.yakuCount<5"><label>{{result.yakuCount}}翻{{result.ten[0]}}符</label> {{result.ten[1]}}点</template>
				<template v-else-if="result.yakuCount==5"><label>满贯</label> {{result.ten[1]}}点</template>
				<template v-else-if="result.yakuCount>=6 && result.yakuCount<8"><label>跳满</label> {{result.ten[1]}}点</template>
				<template v-else-if="result.yakuCount>=8 && result.yakuCount<11"><label>倍满</label> {{result.ten[1]}}点</template>
				<template v-else-if="result.yakuCount>=11 && result.yakuCount<13"><label>三倍满</label> {{result.ten[1]}}点</template>
			</div>
		</div>
		`,
		props:[
			'result'
		],
		methods:HaiMethods
	}
});