/**
 * Created by hkuclion on 2017/4/17.
 */
define({
	displayHai(hai){
		if (Number.isNaN(hai))return null;
		let type = Math.floor(hai / 9);
		let value = hai % 9;

		let map = [
			['一', '二', '三', '四', '五', '六', '七', '八', '九'],
			['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'],
			['１', '２', '３', '４', '５', '６', '７', '８', '９'],
			['东', '南', '西', '北', '白', '发', '中']
		];
		return map[type][value];
	},

	displayHaiValue(haiValue){
		return this.displayHai(haiValue >> 2);
	}
});