define(['Vue','css!lib/layPage/laypage.css'], function (Vue) {

	return {
		template:`
		<div :class="{[className+'_main']:true,['laypageskin_'+skin]:skin}" v-if="pages>1">
			<!-- Prev -->
			<a v-if="curr>1 && prev" @click="jumpToPage(curr-1)" :title="prev" :class="className+'-prev'" :page="curr-1">{{prev}}</a>
			<!-- PrevEnd -->
			<!-- First -->
			<template v-if="dict_index>1 && first && groups != 0">
			<a :title="first" @click="jumpToPage(1)" :class="className+'-first'" :page="1">{{first}}</a><span>\u2026</span>
			</template>
			<!-- FirstEnd -->
			<!-- Groups -->
			<template v-for="index in dict_end-dict_start">
				<span v-if="index+dict_start-1==curr" :class="className+'-curr'">{{index+dict_start-1}}</span>
				<a v-else :title="index" @click="jumpToPage(index+dict_start-1)" :class="className" :page="index+dict_start-1">{{index+dict_start-1}}</a>
			</template>
			<!-- GroupsEnd -->
			<!-- Last -->
			<template v-if="pages>groups && dict_end<pages && last && groups != 0">
			<span>\u2026</span><a :title="last" @click="jumpToPage(pages)" :class="className+'-last'" :page="pages">{{last}}</a>
			</template>
			<!-- LastEnd -->
			<!-- Next -->
			<a v-if="curr!=pages && next || dict_flow" :title="next"  @click="jumpToPage(curr+1)" :class="className+'-next'" :page="curr+1">{{next}}</a>
			<!-- NextEnd -->
			<!-- Skip -->
			<template v-if="skip">
				<form :class="className +'-skip'" @submit.prevent.stop="jumpToPage(jumpTo)">
					<label :class="className +'-skip-pre'">\u5230\u7b2c</label>
					<input type="number" min="1" :max="pages" v-model="jumpTo" class="className +'-skip'">
					<label :class="className +'-skip-post'">\u9875</label>
					<button type="button" class="className +'-btn'" @click="jumpToPage(jumpTo)">\u786e\u5b9a</button>
				</form>
			</template>
			<!-- SkipEnd -->
		</div>
		`,
		props:[
			'page'
		],
		data:function(){
			return {
				first:'首页',
				last:'尾页',
				prev:'上一页',
				next:'下一页',
				className:'laypage',
				groups:5,
				skip:true,
				skin:'molv',
				jumpTo:undefined
			};
		},
		computed:{
			pages:function(){
				return this.page.pageCount;
			},
			curr:function(){
				return this.page.page || 1;
			},
			dict_index:function(){
				return Math.ceil((this.curr + ((this.groups > 1 && this.groups !== this.pages) ? 1 : 0)) / (this.groups === 0 ? 1 : this.groups));
			},
			dict_poor:function(){
				return Math.floor((this.groups - 1) / 2);
			},
			dict_start:function () {
				let dict_start = this.dict_index > 1 ? this.curr - this.dict_poor : 1;
				if (this.dict_end - dict_start < this.groups - 1) {
					dict_start = this.dict_end - this.groups + 1;
				}
				return dict_start;
			},
			dict_end:function () {
				if(this.dict_index > 1){
					let max = this.curr + (this.groups - this.dict_poor - 1);
					return max > this.pages ? this.pages : max;
				}
				return this.groups;
			},
			dict_flow:function () {
				return !this.prev && this.groups === 0;
			}
		},
		methods:{
			jumpToPage:function(page){
				this.$emit('page',parseInt(page));
			}
		}
	}
});