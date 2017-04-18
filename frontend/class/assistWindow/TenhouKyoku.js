/**
 * Created by hkuclion on 2017/4/17.
 */
define([
	'class/assistWindow/Syanten',
	'class/assistWindow/Suggestion/AgariSuggestion',
	'class/assistWindow/Suggestion/DaSuggestion',
	'class/assistWindow/Suggestion/TenSuggestion',
	'class/assistWindow/Suggestion/MoSuggestion',
	'class/assistWindow/Suggestion/SyantenSuggestion',
	'class/assistWindow/Suggestion/NakiSuggestion',
],function(
	Syanten,
	AgariSuggestion,
	DaSuggestion,
	TenSuggestion,
	MoSuggestion,
	SyantenSuggestion,
	NakiSuggestion
){
	const ACTION_PON=1;
	const ACTION_KAN=1<<1;
	const ACTION_CHI=1<<2;
	const ACTION_RON=1<<3;
	const ACTION_TSUMO=1<<4;
	const ACTION_REACH=1<<5;
	const ACTION_RYUUKYOKU=1<<6;
	const ACTION_NUKU=1<<7;

	const NAKI_CHI = 1<<2;
	const NAKI_PON = 1<<3;
	const NAKI_KAKKAN = 1 << 4;
	const NAKI_NUKU = 1 << 5;
	const NAKI_KAN = 0;

	function parseNaki(naki_value) {
		let naki_type = null;
		let kui_un = naki_value & 3;
		let hais = [];
		let kui_index = -1;

		if (naki_value & NAKI_CHI) {
			naki_type = NAKI_CHI;

			let token = naki_value >> 10 & 0x3f; // 1111 1100 0000 0000
			kui_index = token % 3;
			token = Math.floor(token / 3);

			token = parseInt(token / 7) * 9 + (token % 7);
			hais = [
				(token + 0) * 4 + ((naki_value >> 3) & 0x3),
				(token + 1) * 4 + ((naki_value >> 5) & 0x3),
				(token + 2) * 4 + ((naki_value >> 7) & 0x3)
			];
		}
		else if (naki_value & NAKI_PON) {
			naki_type = NAKI_PON;

			let unused = naki_value >> 5 & 0x3; //0000 0000 0110 0000
			let token = naki_value >> 9 & 0x7f; //1111 1110 0000 0000
			kui_index = token % 3;
			token = Math.floor(token / 3);
			hais = [token * 4, token * 4, token * 4];
			switch (unused) {
				case 0:
					hais[0] += 1;
					hais[1] += 2;
					hais[2] += 3;
					break;
				case 1:
					hais[0] += 0;
					hais[1] += 2;
					hais[2] += 3;
					break;
				case 2:
					hais[0] += 0;
					hais[1] += 1;
					hais[2] += 3;
					break;
				case 3:
					hais[0] += 0;
					hais[1] += 1;
					hais[2] += 2;
					break;
			}
		}
		else if (naki_value & NAKI_KAKKAN) {
			naki_type = NAKI_KAKKAN;

			let added = naki_value >> 5 & 0x3; //0000 0000 0110 0000
			let token = naki_value >> 9 & 0x7f; //1111 1110 0000 0000
			kui_index = token % 3;
			token = Math.floor(token / 3);
			hais = [token * 4, token * 4, token * 4, token * 4 + added];

			switch (added) {
				case 0:
					hais[0] += 1;
					hais[1] += 2;
					hais[2] += 3;
					break;
				case 1:
					hais[0] += 0;
					hais[1] += 2;
					hais[2] += 3;
					break;
				case 2:
					hais[0] += 0;
					hais[1] += 1;
					hais[2] += 3;
					break;
				case 3:
					hais[0] += 0;
					hais[1] += 1;
					hais[2] += 2;
					break;
			}

			/*
			 var org_m=added<<5 | (token*3+kui_index)<<9 | 1<<3 | kui_un;
			 console.log(org_m,hais);
			 */
			hais[0] = -1;
			hais[1] = -1;
			hais[2] = -1;
		}
		else if (naki_value & NAKI_NUKU) {
			naki_type = NAKI_NUKU;

			kui_index = -1;
			let added = naki_value >> 8 & 0x3; //0000 0011 0000 0000
			let token = naki_value >> 10 & 0x3f; //1111 1100 0000 0000

			hais = [token * 4 + added];
		}
		else {
			naki_type = NAKI_KAN;

			let hai0 = naki_value >> 8 & 0xff; //1111 1111 0000 0000
			if (!kui_un) hai0 = (hai0 & ~3) + 3;

			let token = hai0 & ~3;
			hais = [token, token, token, token];
			kui_index = hai0 % 4;

			switch (kui_index) {
				case 0:
				case 1:
				case 2:
				case 3:
					hais[0] += 0;
					hais[1] += 1;
					hais[2] += 2;
					hais[3] += 3;
					break;
			}

			//???//if (kui_un == 0) kui_index = -1;//special;
		}

		return {
			naki_type,
			kui_un,
			hais,
			kui_index,
		};
	}
	
	return class TenhouKyoku {
		constructor(type, index, oya, dora_hais, tehais, ten) {
			Object.assign(this, {
				type,index, oya, dora_hais, tehais, ten
			});

			this.tehais.sort((a, b) => a - b);

			this.knownHaiValues = [];
			for (let i = 0; i < 34; i++) {
				this.knownHaiValues.push(0)
			}
			dora_hais.forEach(this.addDora, this);
			tehais.forEach(this.haiAppear, this);

			this.suggestion = this.analyseNo();
			this.result = null;
		}

		get stringKyoku(){
			return (this.index>=4 ?'南':'东')+(this.index%4+1)+'局'
		}

		get stringOya(){
			return ['东','南','西','北'][(4-this.oya)%4];
		}

		haiAppear(hai) {
			this.knownHaiValues[hai >> 2]++;
		}

		moTehai(hai,action) {
			this.haiAppear(hai);
			this.tehais = this.tehais.concat([hai]);
			this.suggestion = this.analyseDa();
		}

		daTehai(hai) {
			this.tehais = this.tehais.filter((number) => number !== hai).sort((a, b) => a - b);
			this.suggestion = this.analyseNo();
		}

		daHai(hai,action,who) {
			this.haiAppear(hai);

			if(action){
				this.suggestion = this.analyseNaki(hai,action);
			}
		}

		addDora(hai){
			this.haiAppear(hai);
		}

		nakiTehai(m){
			let nakiInfo = parseNaki(m);
			for (let hai of nakiInfo.hais) {
				this.haiAppear(hai);
			}

			this.tehais = this.tehais.filter((number) => !nakiInfo.hais.includes(number)).sort((a, b) => a - b);
			this.suggestion = this.analyseDa();
		}

		nakiHai(m){
			let nakiInfo = parseNaki(m);
			for(let hai of nakiInfo.hais){
				this.haiAppear(hai);
			}
			this.suggestion = this.analyseNo();
		}

		analyseDa(source = this.tehais){
			let current_syanten = new Syanten(source).calc();
			if (current_syanten === -1) {
				return new AgariSuggestion();
			}

			let data = [];
			let checkSet = new Set();

			source.forEach((hai) => {
				let hai_value = hai>>2;

				if (checkSet.has(hai_value))return;
				checkSet.add(hai_value);

				let mo_suggestion = this.analyseMo(source.filter(number => number !== hai));

				if (mo_suggestion.syanten === current_syanten) {
					data.push({
						hai_value:hai_value,
						mo:mo_suggestion
					});
				}
			});

			data.sort((a, b) => b.mo.data.count - a.mo.data.count);

			return new DaSuggestion(current_syanten,data);
		}

		analyseMo(source = this.tehais){
			let current_syanten = new Syanten(source).calc();

			let data = {
				hai_values:[],
				count:0
			};

			for (let i = 0; i < this.knownHaiValues.length; i++) {
				if (this.knownHaiValues[i] < 4 && new Syanten(source.concat([i << 2])).calc() < current_syanten) {
					data.hai_values.push(i);
					data.count += 4 - this.knownHaiValues[i];
				}
			}

			return new MoSuggestion(current_syanten, data);
		}

		analyseNo(source = this.tehais){
			let current_syanten = new Syanten(source).calc();

			if(current_syanten === 0){
				let data = [];
				let count = 0;

				for (let i = 0; i < this.knownHaiValues.length; i++) {
					if (this.knownHaiValues[i] < 4) {
						if (new Syanten(source.concat([i << 2])).calc() == -1) {
							data.push(i);
							count += 4 - this.knownHaiValues[i];
						}
					}
				}

				return new TenSuggestion(data,count);
			}
			else{
				return new SyantenSuggestion(current_syanten);
			}
		}

		analyseNaki(hai,actions){
			let hai_value = hai>>2;

			if(actions & ACTION_RON){
				return new AgariSuggestion();
			}

			let data = [];
			if(actions & ACTION_PON){
				let matched = this.tehais.filter(number=>number>>2 === hai_value).slice(0,2);
				data.push({
					type:'PON',
					hai_values:[hai_value, hai_value],
					hai_value:hai_value,
					data:this.analyseDa(this.tehais.filter(number => !matched.includes(number)))
				});
			}
			if(actions & ACTION_CHI){
				if(hai_value > 1) {
					let max_matched = [
						this.tehais.filter(number => (number >> 2) + 2 === hai_value),
						this.tehais.filter(number => (number >> 2) + 1 === hai_value)
					];
					if (max_matched[0].length && max_matched[1].length) {
						let matched = [max_matched[0][0], max_matched[1][0]];
						data.push({
							type:'CHI',
							hai_value:hai_value,
							hai_values:[hai_value - 2, hai_value - 1],
							data:this.analyseDa(this.tehais.filter(number => !matched.includes(number)))
						});
					}
				}

				if(hai_value>0 && hai_value<8) {
					let mid_matched = [
						this.tehais.filter(number => (number >> 2) + 1 === hai_value),
						this.tehais.filter(number => (number >> 2) - 1 === hai_value)
					];
					if (mid_matched[0].length && mid_matched[1].length) {
						let matched = [mid_matched[0][0], mid_matched[1][0]];
						data.push({
							type:'CHI',
							hai_value:hai_value,
							hai_values:[hai_value - 1, hai_value + 1],
							data:this.analyseDa(this.tehais.filter(number => !matched.includes(number)))
						});
					}
				}

				if(hai_value<7) {
					let min_matched = [
						this.tehais.filter(number => (number >> 2) - 1 === hai_value),
						this.tehais.filter(number => (number >> 2) - 2 === hai_value)
					];
					if (min_matched[0].length && mid_matched[1].length) {
						let matched = [min_matched[0][0], min_matched[1][0]];
						data.push({
							type:'CHI',
							hai_value:hai_value,
							hai_values:[hai_value - 2, hai_value - 1],
							data:this.analyseDa(this.tehais.filter(number => !matched.includes(number)))
						});
					}
				}
			}
			if(actions & ACTION_KAN){
				let matched = this.tehais.filter(number => number >> 2 === hai_value);
				data.push({
					type:'KAN',
					hai_value:hai_value,
					hai_values:[hai_value, hai_value, hai_value],
					data:this.analyseMo(this.tehais.filter(number => !matched.includes(number)))
				});
			}

			return new NakiSuggestion(data);
		}
	}
});