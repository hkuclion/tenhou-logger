/**
 * Created by hkuclion on 2017/4/17.
 */
define(['class/assistWindow/TenhouKyoku', 'class/mainWindow/Paifu'],function(TenhouKyoku,Paifu){
	let noop = () => {};

	return class TenhouGame {
		constructor(type) {
			this.type = type;
			this.kyoku = null;
		}

		get typeString() {
			if(this.type === null)return '未知';
			return Paifu.typeString(this.type);
		}

		startKyoku(index, oya, dora_hais, tehais, ten) {
			this.kyoku = new TenhouKyoku(this.type, index, oya, dora_hais, tehais, ten)
		}
	};
});