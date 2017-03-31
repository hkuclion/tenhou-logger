/**
 * Created by hkuclion on 2017/3/22.
 */
define(['Vue','WdatePicker','lib/hkuc/dialog'], function (Vue, WDatePicker,HKUCDialog) {
	let deep_equal=function(a,b){
		let type_a = typeof a;
		let type_b = typeof b;
		if(type_a !== type_b)return false;

		let is_array_a = Array.isArray(a);
		let is_array_b = Array.isArray(b);
		if(is_array_a !== is_array_b)return false;

		if(is_array_a){
			if(a.length !== b.length)return false;
			let sorted_a = a.slice().sort();
			let sorted_b = b.slice().sort();
			for(let i=0; i<sorted_a.length; i++){
				if(!deep_equal(sorted_a[i],sorted_b[i]))return false;
			}
			return true;
		}
		else if(type_a === 'object'){
			if (a === null || b === null)return a === b;

			let a_keys = Object.keys(a).sort();
			let b_keys = Object.keys(b).sort();

			if(!deep_equal(a_keys,b_keys))return false;
			for(let i=0;i<a_keys.length; i++){
				if(!deep_equal(a[a_keys[i]],b[b_keys[i]]))return false
			}
			return true;
		}
		else{
			return a===b;
		}
	};

	return {
		template:`
		<div class="search" v-if="search">
			<span role="startDate" title="开始日期，包括当前日期" @click="selectDate" @contextmenu.prevent.stop="clearDate">
				{{search.start_date?search.start_date:'-'}}
				<input type="hidden" v-model="search.start_date">
			</span>
			<span role="endDate" title="结束日期，包括当前日期" @click="selectDate" @contextmenu.prevent.stop="clearDate">
				{{search.end_date?search.end_date:'-'}}
				<input type="hidden" v-model="search.end_date">
			</span>
			<span role="player" title="可以用空格分开多个玩家" @click="selectPlayer" @contextmenu.prevent.stop="clearPlayer">{{search.player?search.player:'-'}}</span>
			<span role="toPlayer" title="请输入精确玩家名，暂不支持多个玩家" @click="selectToPlayer" @contextmenu.prevent.stop="clearToPlayer">{{search.toplayer?search.toplayer:'-'}}</span>
			<span role="rank" @click="selectRank" @contextmenu.prevent.stop="clearRank">{{search.rank?search.rank:'-'}}</span>
			<span role="comment" title="模糊匹配，*表示所有评论" @click="selectComment" @contextmenu.prevent.stop="clearComment">{{search.comment?search.comment:'-'}}</span>
			<span role="lobby" title="0表示大厅" @click="selectLobby"  @contextmenu.prevent.stop="clearLobby">{{search.lobby?search.lobby:'-'}}</span>
			<span role="type" @click="selectType" @contextmenu.prevent.stop="clearType">
				<span title="技能" v-if="search.type && search.type.gino">{{search.type.gino.join('|')}}</span>
				<span title="人数" v-if="search.type && search.type.sanma">{{search.type.sanma.join('|')}}</span>
				<span title="桌别" v-if="search.type && search.type.taku">{{search.type.taku.join('|')}}</span>
				<span title="雀庄" v-if="search.type && search.type.shuku">{{search.type.shuku.join('|')}}</span>
				<span title="庄别" v-if="search.type && search.type.hanchan">{{search.type.hanchan.join('|')}}</span>
				<span title="食断" v-if="search.type && search.type.kui">{{search.type.kui.join('|')}}</span>
				<span title="速别" v-if="search.type && search.type.soku">{{search.type.soku.join('|')}}</span>
				<span title="赤牌" v-if="search.type && search.type.aka">{{search.type.aka.join('|')}}</span>
			</span>
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

				if(ev.srcElement.getAttribute('role') === 'endDate' && this.search.startDate){
					options.minDate = this.search.startDate
				}

				WDatePicker(options);
			},
			clearDate:function(){
				let element = ev.srcElement.querySelector('input[type=hidden]');
				if(element.value === '')return;

				element.value='';
				this.$emit('change');
			},
			selectPlayer:function(ev){
				HKUCDialog.prompt('可以用空格隔开多个用户',{
					value:this.search.player,
					title:'请输入主玩家名',
					id:'search',
				}).on('ok',(ev,value)=>{
					this.set('player',value?value:null);
				});
			},
			clearPlayer:function (ev) {
				this.set('player', null);
			},
			selectToPlayer:function (ev) {
				HKUCDialog.prompt('暂时只支持精确匹配', {
					value:this.search.toplayer,
					title:'请输入对战玩家名',
					id:'search',
				}).on('ok', (ev, value) => {
					this.set('toplayer', value ? value : null);
				});
			},
			clearToPlayer:function (ev) {
				this.set('toplayer', null);
			},
			selectRank:function(ev){
				HKUCDialog.form([
					{name:'rank', type:'checkbox', label:null, options:{
						'0':'未记录',
						'1':'1位',
						'2':'2位',
						'3':'3位',
						'4':'4位',
					}, value:this.search.rank? this.search.rank.split(' '):null},
				],{
					title:'选择顺位',
					id:'search',
				}).on('ok',(ev,data)=>{
					let value = data.rank ? data.rank.join(' ') : null;
					this.set('rank', value ? value : null);
				});
			},
			clearRank:function(ev){
				this.set('rank', null);
			},
			selectComment:function (ev) {
				HKUCDialog.prompt('*表示所有注释', {
					value:this.search.comment,
					title:'请输入注释内容',
					'id':'search',
				}).on('ok', (ev, value) => {
					this.set('comment', value ? value : null);
				});
			},
			clearComment:function (ev) {
				this.set('comment', null);
			},
			selectLobby:function (ev) {
				HKUCDialog.prompt('0表示大厅', {
					value:this.search.lobby,
					title:'请输入个室号',
					'id':'search',
				}).on('ok', (ev, value) => {
					this.set('lobby', value ? value : null);
				});
			},
			clearLobby:function (ev) {
				this.set('lobby', null);
			},
			selectType:function (ev){
				HKUCDialog.form([
					{
						name:'gino',
						type:'checkbox',
						label:'技能',
						options:{'技':'技能',},
						value:this.search.type && this.search.type.gino ? this.search.type.gino : null
					},
					{
						name:'sanma',
						type:'checkbox',
						label:'人数',
						options:{'三':'三麻','四':'四麻'},
						value:this.search.type && this.search.type.sanma ? this.search.type.sanma : null
					},
					{
						name:'taku',
						type:'checkbox',
						label:'桌别',
						options:{'般':'般场', '上':'上级','特':'特上','凤':'凤凰'},
						value:this.search.type && this.search.type.taku ? this.search.type.taku : null
					},
					{
						name:'shuku',
						type:'checkbox',
						label:'雀庄',
						options:{'无':'非雀庄', '０':'祝０', '２':'祝２', '５':'祝５'},
						value:this.search.type && this.search.type.shuku ? this.search.type.shuku : null
					},
					{
						name:'hanchan',
						type:'checkbox',
						label:'庄别',
						options:{'东':'东风', '南':'东南'},
						value:this.search.type && this.search.type.hanchan ? this.search.type.hanchan : null
					},
					{
						name:'kui',
						type:'checkbox',
						label:'食断',
						options:{'无':'无', '有':'有'},
						value:this.search.type && this.search.type.kui ? this.search.type.kui : null
					},
					{
						name:'soku',
						type:'checkbox',
						label:'速别',
						options:{'慢':'慢', '速':'速'},
						value:this.search.type && this.search.type.soku ? this.search.type.soku : null
					},
					{
						name:'aka',
						type:'checkbox',
						label:'赤牌',
						options:{'无':'无', '有':'有'},
						value:this.search.type && this.search.type.aka ? this.search.type.aka : null
					},
				], {
					'title':'选择类型',
					'id':'search',
				}).on('ok', (ev, data) => {
					let value = Object.keys(data).length ? data : null;
					this.set('type', value ? value : null);
				});
			},
			clearType:function (ev) {
				this.set('type', null);
			},
			set:function(prop,value){
				if (deep_equal(this.search[prop] , value))return;

				this.search[prop] = value;
				this.$emit('change');
			}
		}
	}
});