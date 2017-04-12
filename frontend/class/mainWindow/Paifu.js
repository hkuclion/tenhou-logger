/**
 * Created by hkuclion on 2017/3/17.
 */
define(['lib/hkuc/dialog','lib/hkuc/template','class/SerialCall'],function(HKUCDialog,HKUCTemplate, SerialCall){
	let paifu_text_template= `{{$paifu.date}} | {{$helpers.typeToString($paifu.type)}} | {{$paifu.url}}
{{$paifu.rank}}位{{foreach $paifu.un as $index=>$user}}{{if $user}} {{'',$score=$paifu.sc[$index * 2 + 1]}}{{$user}}({{$score>=0?"+":""}}{{$score}}{{if $paifu.sc.length>8}},{{$paifu.sc[$index * 2+ 8]}}枚{{/if}}){{/if}}{{/foreach}}`;
	HKUCTemplate.compile('paifu_text', paifu_text_template, {compress:false, escape:false});

	class Paifu {
		get componentName() {
			return 'paifu';
		}

		constructor(data) {
			this.setData(data);
			this.selected=false;
		}

		setData(data){
			Object.assign(this, data);
		}

		get type_string(){
			return translateType(this.type,'string');
		}

		static fromLogStr(log_str) {
			return new Paifu(parseLogStr(log_str));
		}

		toString(type = 'text') {
			if (type == 'logstr') {
				return this.log_str;
			}
			return HKUCTemplate.render('paifu_text',{$paifu:this});
		}

		async review(){
			let try_review = await SerialCall.call('REVIEW_PAIFU', this.url, false);
			if(!try_review){
				HKUCDialog.confirm('当前有牌谱正在重放中，要覆盖它吗？')
					.on('ok',()=>{
						SerialCall.call('REVIEW_PAIFU', this.url, true);
					});
			}
		}
	}

	function parseLogStr(log_str) {
		let ret = {log_str};

		let params = {};
		for (let param of decodeURIComponent(log_str).split('&')) {
			let [key, value] = param.split('=');
			params[key] = value;
		}

		ret['oya'] = parseInt(params['oya']);
		ret['type'] = parseInt(params['type']);
		let is_sanma = ret['type'] & 0x10;

		if (!params['sc']) {
			ret['sc'] = ('0,0.0,0,0.0,0,0.0,0,0.0').split(',');
			ret['yet'] = true;
			ret['rank'] = 0;
		}
		else {
			ret['sc'] = params['sc'].split(',');
			ret['yet'] = false;

			let rank = 1;
			let unused_un = -1;
			if (is_sanma) unused_un = (4 + ret['oya'] - 1) % 4;

			for (let i = 1; i <= 3; i++) {
				if (i == unused_un)continue;
				if (parseInt(ret['sc'][0]) < parseInt(ret['sc'][i * 2]) || (parseInt(ret['sc'][0]) == parseInt(ret['sc'][i * 2]) && (params['oya'] && params['oya'] <= i))) rank += 1;
			}
			ret['rank'] = rank;
		}

		ret['url'] = 'http://tenhou.net/0/?log=' + params['file'] + '&tw=' + (4 - params['oya']) % 4;
		ret['un'] = [params['un0'], params['un1'], params['un2'], params['un3']];

		ret['date'] = [params['file'].substr(0, 4), params['file'].substr(4, 2), params['file'].substr(6, 2)].join('-');
		ret['lobby'] = parseInt(params['file'].substr(18, 4), 10);

		let type_data = translateType(ret['type'],'array');
		for(let key of Object.keys(type_data)){
			ret['type_'+key]= type_data[key];
		}

		return ret;
	}

	function extractLogObject(log_obj) {
		let ret = {};

		for (let key of ['log_str', 'oya', 'type', 'sc', 'yet', 'rank', 'url', 'un', 'date', 'lobby']) {
			ret[key] = log_obj.Tlog[key];
		}

		return ret;
	}

	function translateType(type,format) {
		let p_type = type;
		let ret = null;
		let is_jansou = p_type & 0x600;
		let is_gino = p_type & 0x800;
		let TYPE = {
			sanma:{
				filter:0x10,
				display:{0x00:'', 0x10:'三'},
				data:{0x00:'四', 0x10:'三'}
			},
			gino:{
				filter:0x800,
				display:{0x00:'', 0x800:'技'},
				data:{0x00:'无', 0x800:'技'}
			},
			taku:{
				filter:0xa0,
				display:is_jansou ? {0xa0:'孔', 0x80:'银', 0x20:'琥', 0x00:'若'} : {0xa0:'凤', 0x80:'上', 0x20:'特', 0x00:'般'},
				data:is_jansou ? {0xa0:'孔', 0x80:'银', 0x20:'琥', 0x00:'若'} : {0xa0:'凤', 0x80:'上', 0x20:'特', 0x00:'般'}
			},
			hanchan:{
				filter:0x8,
				display:{0x00:'东', 0x8:'南'},
				data:{0x00:'东', 0x8:'南'}
			},
			kui:{
				filter:0x4,
				display:is_jansou ? {0x00:'喰'} : {0x00:'喰', 0x4:''},
				data:is_jansou ? {0x00:'食'} : {0x00:'食', 0x4:'无'}
			},
			aka:{
				filter:0x2,
				display:is_jansou ? {0x00:'赤'} : {0x00:'赤', 0x2:''},
				data:is_jansou ? {0x00:'赤'} : {0x00:'赤', 0x2:'无'}
			},
			soku:is_jansou ? {
				filter:0x8,
				display:{0x00:'速', 0x8:''},
				data:{0x00:'速', 0x8:'慢'}
			} : {
				filter:0x40,
				display:{0x00:'', 0x40:'速'},
				data:{0x00:'慢', 0x40:'速'}
			},
			shuku:{
				filter:0x600,
				display:{0x0:'', 0x200:'祝２', 0x400:'祝０', 0x600:'祝５'},
				data:{0x0:'无', 0x200:'２', 0x400:'０', 0x600:'５'}
			}
		};

		if(format == 'string') {
			ret = '';
			for (let key of Object.keys(TYPE)) {
				if (is_gino) {
					if (key == 'taku' || key == 'hanchan')continue;
				}
				ret += TYPE[key].display[p_type & TYPE[key].filter];
			}
		}
		else if(format == 'array'){
			ret = {};
			for (let key of Object.keys(TYPE)) {
				ret[key] = TYPE[key].data[p_type & TYPE[key].filter];
			}
		}

		return ret;
	}

	return Paifu;
});