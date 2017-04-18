/**
 * Created by hkuclion on 2017/4/17.
 */
define(function () {
	return class Syanten {
		constructor(hais) {
			this.n_eval = 0;
			// input
			this.c = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			// status
			this.n_mentsu = 0;
			this.n_tatsu = 0;
			this.n_toitsu = 0;
			this.n_jidahai = 0; // １３枚にしてから少なくとも打牌しなければならない字牌の数 -> これより向聴数は下がらない
			this.f_n4 = 0; // 27bitを数牌、1bitを字牌で使用
			this.f_koritsu = 0; // 孤立牌
			// final result
			this.min_syanten = 8;

			hais.forEach((hai) => {
				this.c[hai >> 2]++;
			});
		}

		count34() {
			let count = 0;
			this.c.forEach((number) => {
				count += number;
			});
			return count;
		}

		scanChiitoiKokushi() {
			let syanten = this.min_syanten;
			let c = this.c;
			let n13 = // 幺九牌の対子候補の数
				(c[0] >= 2) + (c[8] >= 2) +
				(c[9] >= 2) + (c[17] >= 2) +
				(c[18] >= 2) + (c[26] >= 2) +
				(c[27] >= 2) + (c[28] >= 2) + (c[29] >= 2) + (c[30] >= 2) + (c[31] >= 2) + (c[32] >= 2) + (c[33] >= 2);
			let m13 = // 幺九牌の種類数
				(c[0] != 0) + (c[8] != 0) +
				(c[9] != 0) + (c[17] != 0) +
				(c[18] != 0) + (c[26] != 0) +
				(c[27] != 0) + (c[28] != 0) + (c[29] != 0) + (c[30] != 0) + (c[31] != 0) + (c[32] != 0) + (c[33] != 0);
			let n7 = n13 + // 対子候補の数
				(c[1] >= 2) + (c[2] >= 2) + (c[3] >= 2) + (c[4] >= 2) + (c[5] >= 2) + (c[6] >= 2) + (c[7] >= 2) +
				(c[10] >= 2) + (c[11] >= 2) + (c[12] >= 2) + (c[13] >= 2) + (c[14] >= 2) + (c[15] >= 2) + (c[16] >= 2) +
				(c[19] >= 2) + (c[20] >= 2) + (c[21] >= 2) + (c[22] >= 2) + (c[23] >= 2) + (c[24] >= 2) + (c[25] >= 2);
			let m7 = m13 + // 牌の種類数
				(c[1] != 0) + (c[2] != 0) + (c[3] != 0) + (c[4] != 0) + (c[5] != 0) + (c[6] != 0) + (c[7] != 0) +
				(c[10] != 0) + (c[11] != 0) + (c[12] != 0) + (c[13] != 0) + (c[14] != 0) + (c[15] != 0) + (c[16] != 0) +
				(c[19] != 0) + (c[20] != 0) + (c[21] != 0) + (c[22] != 0) + (c[23] != 0) + (c[24] != 0) + (c[25] != 0);
			{ // 七対子
				let ret_syanten = 6 - n7 + (m7 < 7 ? 7 - m7 : 0);
				if (ret_syanten < syanten) syanten = ret_syanten;
			}
			{ // 国士無双
				let ret_syanten = 13 - m13 - (n13 ? 1 : 0);
				if (ret_syanten < syanten) syanten = ret_syanten;
			}
			return syanten;
		}

		removeJihai(nc) { // 字牌
			let c = this.c;
			let j_n4 = 0; // 7bitを字牌で使用
			let j_koritsu = 0; // 孤立牌
			for (let i = 27; i < 34; ++i) switch (c[i]) {
				case 4:
					++this.n_mentsu;
					j_n4 |= (1 << (i - 27));
					j_koritsu |= (1 << (i - 27));
					++this.n_jidahai;
					break;
				case 3:
					++this.n_mentsu;
					break;
				case 2:
					++this.n_toitsu;
					break;
				case 1:
					j_koritsu |= (1 << (i - 27));
					break;
			}
			if (this.n_jidahai && (nc % 3) == 2) --this.n_jidahai;

			if (j_koritsu) { // 孤立牌が存在する
				this.f_koritsu |= (1 << 27);
				if ((j_n4 | j_koritsu) == j_n4) this.f_n4 |= (1 << 27); // 対子を作成できる孤立牌が無い
			}
		}

		scanNormal(init_mentsu) {
			let c = this.c;
			this.f_n4 |= // 孤立しても対子(雀頭)になれない数牌
				((c[0] == 4) << 0) | ((c[1] == 4) << 1) | ((c[2] == 4) << 2) | ((c[3] == 4) << 3) | ((c[4] == 4) << 4) | ((c[5] == 4) << 5) | ((c[6] == 4) << 6) | ((c[7] == 4) << 7) | ((c[8] == 4) << 8) |
				((c[9] == 4) << 9) | ((c[10] == 4) << 10) | ((c[11] == 4) << 11) | ((c[12] == 4) << 12) | ((c[13] == 4) << 13) | ((c[14] == 4) << 14) | ((c[15] == 4) << 15) | ((c[16] == 4) << 16) | ((c[17] == 4) << 17) |
				((c[18] == 4) << 18) | ((c[19] == 4) << 19) | ((c[20] == 4) << 20) | ((c[21] == 4) << 21) | ((c[22] == 4) << 22) | ((c[23] == 4) << 23) | ((c[24] == 4) << 24) | ((c[25] == 4) << 25) | ((c[26] == 4) << 26);
			this.n_mentsu += init_mentsu;
			this.Run(0);
		}

		Run(depth) { // ネストは高々１４回
			++this.n_eval;
			if (this.min_syanten == -1) return; // 和了は１つ見つければよい
			let c = this.c;
			for (; depth < 27 && !c[depth]; ++depth); // skip
			if (depth == 27) return this.updateResult();

			let i = depth;
			if (i > 8) i -= 9;
			if (i > 8) i -= 9; // mod_9_in_27
			switch (c[depth]) {
				case 4:
					// 暗刻＋順子|搭子|孤立
					this.i_anko(depth);
					if (i < 7 && c[depth + 2]) {
						if (c[depth + 1]) this.i_syuntsu(depth), this.Run(depth + 1), this.d_syuntsu(depth); // 順子
						this.i_tatsu_k(depth), this.Run(depth + 1), this.d_tatsu_k(depth); // 嵌張搭子
					}
					if (i < 8 && c[depth + 1]) this.i_tatsu_r(depth), this.Run(depth + 1), this.d_tatsu_r(depth); // 両面搭子
					this.i_koritsu(depth), this.Run(depth + 1), this.d_koritsu(depth); // 孤立
					this.d_anko(depth);
					// 対子＋順子系 // 孤立が出てるか？ // 対子＋対子は不可
					this.i_toitsu(depth);
					if (i < 7 && c[depth + 2]) {
						if (c[depth + 1]) this.i_syuntsu(depth), this.Run(depth), this.d_syuntsu(depth); // 順子＋他
						this.i_tatsu_k(depth), this.Run(depth + 1), this.d_tatsu_k(depth); // 搭子は２つ以上取る必要は無い -> 対子２つでも同じ
					}
					if (i < 8 && c[depth + 1]) this.i_tatsu_r(depth), this.Run(depth + 1), this.d_tatsu_r(depth);
					this.d_toitsu(depth);
					break;
				case 3:
					// 暗刻のみ
					this.i_anko(depth), this.Run(depth + 1), this.d_anko(depth);
					// 対子＋順子|搭子
					this.i_toitsu(depth);
					if (i < 7 && c[depth + 1] && c[depth + 2]) {
						this.i_syuntsu(depth), this.Run(depth + 1), this.d_syuntsu(depth); // 順子
					} else { // 順子が取れれば搭子はその上でよい
						if (i < 7 && c[depth + 2]) this.i_tatsu_k(depth), this.Run(depth + 1), this.d_tatsu_k(depth); // 嵌張搭子は２つ以上取る必要は無い -> 対子２つでも同じ
						if (i < 8 && c[depth + 1]) this.i_tatsu_r(depth), this.Run(depth + 1), this.d_tatsu_r(depth); // 両面搭子
					}
					this.d_toitsu(depth);
					// 順子系
					if (i < 7 && c[depth + 2] >= 2 && c[depth + 1] >= 2) this.i_syuntsu(depth), this.i_syuntsu(depth), this.Run(depth), this.d_syuntsu(depth), this.d_syuntsu(depth); // 順子＋他
					break;
				case 2:
					// 対子のみ
					this.i_toitsu(depth), this.Run(depth + 1), this.d_toitsu(depth);
					// 順子系
					if (i < 7 && c[depth + 2] && c[depth + 1]) this.i_syuntsu(depth), this.Run(depth), this.d_syuntsu(depth); // 順子＋他
					break;
				case 1:
					// 孤立牌は２つ以上取る必要は無い -> 対子のほうが向聴数は下がる -> ３枚 -> 対子＋孤立は対子から取る
					// 孤立牌は合計８枚以上取る必要は無い
					if (i < 6 && c[depth + 1] == 1 && c[depth + 2] && c[depth + 3] != 4) { // 延べ単
						this.i_syuntsu(depth), this.Run(depth + 2), this.d_syuntsu(depth); // 順子＋他
					} else {
//				if (n_koritsu<8) this.i_koritsu(depth), this.Run(depth+1), this.d_koritsu(depth);
						this.i_koritsu(depth), this.Run(depth + 1), this.d_koritsu(depth);
						// 順子系
						if (i < 7 && c[depth + 2]) {
							if (c[depth + 1]) this.i_syuntsu(depth), this.Run(depth + 1), this.d_syuntsu(depth); // 順子＋他
							this.i_tatsu_k(depth), this.Run(depth + 1), this.d_tatsu_k(depth); // 搭子は２つ以上取る必要は無い -> 対子２つでも同じ
						}
						if (i < 8 && c[depth + 1]) this.i_tatsu_r(depth), this.Run(depth + 1), this.d_tatsu_r(depth);
					}
					break;
			}
		}

		i_anko(k) {
			this.c[k] -= 3;
			++this.n_mentsu;
		}

		d_anko(k) {
			this.c[k] += 3;
			--this.n_mentsu;
		}

		i_toitsu(k) {
			this.c[k] -= 2;
			++this.n_toitsu;
		}

		d_toitsu(k) {
			this.c[k] += 2;
			--this.n_toitsu;
		}

		i_syuntsu(k) {
			--this.c[k];
			--this.c[k + 1];
			--this.c[k + 2];
			++this.n_mentsu;
		}

		d_syuntsu(k) {
			++this.c[k];
			++this.c[k + 1];
			++this.c[k + 2];
			--this.n_mentsu;
		}

		i_tatsu_r(k) {
			--this.c[k];
			--this.c[k + 1];
			++this.n_tatsu;
		}

		d_tatsu_r(k) {
			++this.c[k];
			++this.c[k + 1];
			--this.n_tatsu;
		}

		i_tatsu_k(k) {
			--this.c[k];
			--this.c[k + 2];
			++this.n_tatsu;
		}

		d_tatsu_k(k) {
			++this.c[k];
			++this.c[k + 2];
			--this.n_tatsu;
		}

		i_koritsu(k) {
			--this.c[k];
			this.f_koritsu |= (1 << k);
		}

		d_koritsu(k) {
			++this.c[k];
			this.f_koritsu &= ~(1 << k);
		}

		updateResult() {
			let ret_syanten = 8 - this.n_mentsu * 2 - this.n_tatsu - this.n_toitsu;
			let n_mentsu_kouho = this.n_mentsu + this.n_tatsu;
			if (this.n_toitsu) {
				n_mentsu_kouho += this.n_toitsu - 1;
			} else if (this.f_n4 && this.f_koritsu) {
				if ((this.f_n4 | this.f_koritsu) == this.f_n4) ++ret_syanten; // 対子を作成できる孤立牌が無い
			}
			if (n_mentsu_kouho > 4) ret_syanten += (n_mentsu_kouho - 4);
			if (ret_syanten != -1 && ret_syanten < this.n_jidahai) ret_syanten = this.n_jidahai;
			if (ret_syanten < this.min_syanten) this.min_syanten = ret_syanten;
		}

		calc() {
			let nc = this.count34();
			if (nc > 14) return -2; // ネスト検査が爆発する
			if (nc >= 13) this.min_syanten = this.scanChiitoiKokushi(nc); // １３枚より下の手牌は評価できない

			this.removeJihai(nc);
			let init_mentsu = Math.floor((14 - nc) / 3); // 副露面子を逆算
			this.scanNormal(init_mentsu);
			return this.min_syanten;
		}
	}
});