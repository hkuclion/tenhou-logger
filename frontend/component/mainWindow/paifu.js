/**
 * Created by hkuclion on 2017/3/17.
 */
define(['Vue'], function (Vue) {
	let paifu_user_component= {
		template:`
			<span role="user">{{user}}<span role="ten">({{formattedScore}}<template v-if="mai">,{{mai}}枚</template>)</span></span>
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
		<li :class="{selected:paifu.selected}" @dblclick.prevent="review" @click="select" @selectstart="selectStart" @contextmenu="contextMenu">
			<span role="date">
				<i role="year">{{paifu.date.substr(0,5)}}</i><i role="month-day">{{paifu.date.substr(5)}}</i>
			</span>
			<span role="delimiter"> | </span>
			<span role="type">{{paifu.type_string}}</span>
			<span role="delimiter"> | </span>
			<span role="url">{{paifu.url}}</span>
			<span role="line_break"><br /></span>
			<span role="rank">{{paifu.rank}}位</span>
			<template v-for="(user,user_index) in paifu.un" v-if="user">
			<span role="delimiter">&nbsp;</span>
			<paifu-user :score="paifu.sc[user_index*2+1]" :user="user" :mai="paifu.sc.length>8?paifu.sc[user_index * 2+ 8]:false"></paifu-user>
			</template>
			
			<i v-if="paifu.comment" role="comment" :class="{'fa fa-comment':!editMode,'text-comment':editMode}" :title="editMode?'':paifu.comment">{{editMode?paifu.comment:''}}</i>
		</li>
		`,
		props:[
			'paifu','index','shiftHold','editMode'
		],
		methods:{
			select:function (ev) {
				if(ev.srcElement == this.$el) {
					this.$emit('selected',this.index,ev.shiftKey,ev.ctrlKey);
					ev.preventDefault();
				}
			},
			selectStart:function(ev){
				if (ev.srcElement == this.$el) {
					ev.preventDefault();
				}
			},
			contextMenu:function(ev){
				this.$emit('contextmenu',ev);
			},
			review:function(){
				this.paifu.review();
			}
		},
		components:{
			'paifu-user':paifu_user_component
		}
	}
});