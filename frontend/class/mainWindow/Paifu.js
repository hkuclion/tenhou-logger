/**
 * Created by hkuclion on 2017/3/17.
 */
define(function(){
	class Paifu {
		get componentName() {
			return 'paifu';
		}

		constructor(data) {
			Object.assign(this,data);
		}

		get type_string(){
			return typeToString(this.type);
		}

		static fromLogStr(log_str) {
			return new Paifu(parseLogStr(log_str));
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

		return ret;
	}

	function extractLogObject(log_obj) {
		let ret = {};

		for (let key of ['log_str', 'oya', 'type', 'sc', 'yet', 'rank', 'url', 'un', 'date', 'lobby']) {
			ret[key] = log_obj.Tlog[key];
		}

		return ret;
	}

	function typeToString(type) {
		let p_type = type;
		let ret_str = '';
		let is_jansou = p_type & 0x600;
		let is_gino = p_type & 0x800;
		let TYPE = {
			sanma:{
				filter:0x10,
				display:{0x00:'', 0x10:'三'}
			},
			gino:{
				filter:0x800,
				display:{0x00:'', 0x800:'技'}
			},
			taku:{
				filter:0xa0,
				display:is_jansou ? {0xa0:'孔', 0x80:'银', 0x20:'琥', 0x00:'若'} : {0xa0:'凤', 0x80:'上', 0x20:'特', 0x00:'般'}
			},
			hanchan:{
				filter:0x8,
				display:{0x00:'东', 0x8:'南'}
			},
			kui:{
				filter:0x4,
				display:is_jansou ? {0x00:'喰'} : {0x00:'喰', 0x4:''}
			},
			aka:{
				filter:0x2,
				display:is_jansou ? {0x00:'赤'} : {0x00:'赤', 0x2:''}
			},
			soku:is_jansou ? {
					filter:0x8,
					display:{0x00:'速', 0x8:''}
				} : {
					filter:0x40,
					display:{0x00:'', 0x40:'速'}
				},
			shuku:{
				filter:0x600,
				display:{0x0:'', 0x200:'祝２', 0x400:'祝０', 0x600:'祝５'}
			}
		};

		for (let key of Object.keys(TYPE)) {
			if (is_gino) {
				if (key == 'taku' || key == 'hanchan')continue;
			}
			ret_str += TYPE[key].display[p_type & TYPE[key].filter];
		}

		return ret_str;
	}

	return Paifu;
});