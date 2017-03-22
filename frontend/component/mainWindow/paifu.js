/**
 * Created by hkuclion on 2017/3/17.
 */
define(['Vue'], function (Vue) {
	let paifu_user_component= {
		template:`
			<span class="user">{{user}}<span class="ten">({{formattedScore}}<template v-if="mai">,{{mai}}枚</template>)</span></span>
		`,
		props:[
			'user','score','mai'
		],
		computed:{
			formattedScore(){
				return this.score >= 0 ? "+"+this.score : this.score;
			}
		}
	};

	return {
		template:`
		<li @click="select" @contextmenu="contextMenu">
			<span class="date">
				<i class="year">{{paifu.date.substr(0,5)}}</i>
				<i>{{paifu.date.substr(5)}}</i>
			</span>
			<span class="delimiter">&nbsp;|&nbsp;</span>
			<span class="type">{{paifu.type_string}}</span>
			<span class="delimiter">&nbsp;|&nbsp;</span>
			<span class="url">{{paifu.url}}</span>
			<span class="line_break"><br /></span>
			<span class="rank">{{paifu.rank}}位</span>
			<template v-for="(user,user_index) in paifu.un" v-if="user">
			<span class="delimiter">&nbsp;</span>
			<paifu-user :score="paifu.sc[user_index*2+1]" :user="user" :mai="paifu.sc.length>8?paifu.sc[user_index * 2+ 8]:false"></paifu-user>
			</template>
		</li>
		`,
		'props':[
			'paifu','index'
		],
		methods:{
			select:function (ev) {
				if(ev.srcElement == this.$el) {
					this.$emit('selected',this.index,ev.shiftKey,ev.ctrlKey);
				}
			},
			contextMenu:function(){
				console.log('contextMenu');
			}
		},
		components:{
			'paifu-user':paifu_user_component
		}
	}
});