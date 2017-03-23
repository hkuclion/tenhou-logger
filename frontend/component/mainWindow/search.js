/**
 * Created by hkuclion on 2017/3/22.
 */
define(['Vue','WdatePicker'], function (Vue, WdatePicker) {
	return {
		template:`
		<div class="search" v-if="search">
			<span role="startDate" title="开始日期，包括当前日期" @click="selectDate">
				{{search.start_date?search.start_date:'-'}}
				<input type="hidden" v-model="search.start_date">
			</span>
			<span role="endDate" title="结束日期，包括当前日期" @click="selectDate">
				{{search.end_date?search.end_date:'-'}}
				<input type="hidden" v-model="search.end_date">
			</span>
			<span role="player" title="可以用空格分开多个玩家">{{search.player?search.player:'-'}}</span>
			<span role="toPlayer" title="请输入精确玩家名，暂不支持多个玩家">{{search.toplayer?search.toplayer:'-'}}</span>
			<span role="rank">{{search.rank?search.rank:'-'}}</span>
			<span role="comment" title="模糊匹配，*表示所有评论">{{search.comment?search.comment:'-'}}</span>
			<span role="lobby" title="0表示大厅">{{search.lobby?search.lobby:'-'}}</span>
			<span role="type">{{search.type?search.type:'-'}}</span>
		</div>
		`,
		props:[
			'search'
		],
		methods:{
			selectDate:function (ev) {
				let element = ev.srcElement.querySelector('input[type=hidden]');
				let date_changed = () => {
					element.dispatchEvent(new Event('input'));
					this.$emit('change');
				};
				let options = {
					el:element,
					maxDate:'%y-%M-%d',
					onpicked:date_changed,
					oncleared:date_changed,
				};

				if(ev.srcElement.getAttribute('role') == 'endDate' && this.search.startDate){
					options.minDate = this.search.startDate
				}

				WdatePicker(options);
			}

		}
	}
});