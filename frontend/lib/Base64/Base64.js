/**
 * Created by hkuclion on 2017/3/31.
 */
define(function () {
	var b64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var b64pad = "=";

	function hex2b64(h) {
		var i;
		var c;
		var ret = "";
		for (i = 0; i + 3 <= h.length; i += 3) {
			c = parseInt(h.substring(i, i + 3), 16);
			ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
		}
		if (i + 1 == h.length) {
			c = parseInt(h.substring(i, i + 1), 16);
			ret += b64map.charAt(c << 2);
		}
		else if (i + 2 == h.length) {
			c = parseInt(h.substring(i, i + 2), 16);
			ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
		}
		while ((ret.length & 3) > 0) ret += b64pad;
		return ret;
	}

// convert a base64 string to hex
	function b64tohex(s) {
		var ret = ""
		var i;
		var k = 0; // b64 state, 0-3
		var slop;
		for (i = 0; i < s.length; ++i) {
			if (s.charAt(i) == b64pad) break;
			v = b64map.indexOf(s.charAt(i));
			if (v < 0) continue;
			if (k == 0) {
				ret += int2char(v >> 2);
				slop = v & 3;
				k = 1;
			}
			else if (k == 1) {
				ret += int2char((slop << 2) | (v >> 4));
				slop = v & 0xf;
				k = 2;
			}
			else if (k == 2) {
				ret += int2char(slop);
				ret += int2char(v >> 2);
				slop = v & 3;
				k = 3;
			}
			else {
				ret += int2char((slop << 2) | (v >> 4));
				ret += int2char(v & 0xf);
				k = 0;
			}
		}
		if (k == 1)
			ret += int2char(slop << 2);
		return ret;
	}

	var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";

	function int2char(n) {
		return BI_RM.charAt(n);
	}

// convert a base64 string to a byte/number array
	function b64toBA(s) {
		//piggyback on b64tohex for now, optimize later
		var h = b64tohex(s);
		var i;
		var a = [];
		for (i = 0; 2 * i < h.length; ++i) {
			a[i] = parseInt(h.substring(2 * i, 2 * i + 2), 16);
		}
		return a;
	}

//http://www.jzxue.com/wangzhankaifa/javascript-ajax/201209/19-14287.html
	/**
	 * 我在网上看到过很多BASE64的JavaScript算法，都觉得不满意，于是自己写了一个，在这里分享一下。
	 * 我的代码在质量的效率都较高，没有一些冗余的操作。总体来讲我觉得非常不错。
	 * 如果大家有什么不懂的地方可以问我。
	 */
	var BASE64 = {
		/**
		 * 此变量为编码的key，每个字符的下标相对应于它所代表的编码。
		 */
		enKey:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
		/**
		 * 此变量为解码的key，是一个数组，BASE64的字符的ASCII值做下标，所对应的就是该字符所代表的编码值。
		 */
		deKey:[
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
			52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
			-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
			15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
			-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
			41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
		],
		/**
		 * 编码
		 */
		encode:function (src) {
			//用一个数组来存放编码后的字符，效率比用字符串相加高很多。
			var str = [];
			var ch1, ch2, ch3;
			var pos = 0;
			//每三个字符进行编码。
			while (pos + 3 <= src.length) {
				ch1 = src.charCodeAt(pos++);
				ch2 = src.charCodeAt(pos++);
				ch3 = src.charCodeAt(pos++);
				str.push(this.enKey.charAt(ch1 >> 2), this.enKey.charAt(((ch1 << 4) + (ch2 >> 4)) & 0x3f));
				str.push(this.enKey.charAt(((ch2 << 2) + (ch3 >> 6)) & 0x3f), this.enKey.charAt(ch3 & 0x3f));
			}
			//给剩下的字符进行编码。
			if (pos < src.length) {
				ch1 = src.charCodeAt(pos++);
				str.push(this.enKey.charAt(ch1 >> 2));
				if (pos < src.length) {
					ch2 = src.charCodeAt(pos);
					str.push(this.enKey.charAt(((ch1 << 4) + (ch2 >> 4)) & 0x3f));
					str.push(this.enKey.charAt(ch2 << 2 & 0x3f), '=');
				} else {
					str.push(this.enKey.charAt(ch1 << 4 & 0x3f), '==');
				}
			}
			//组合各编码后的字符，连成一个字符串。
			return str.join('');
		},
		/**
		 * 解码。
		 */
		decode:function (src) {
			//用一个数组来存放解码后的字符。
			var str = [];
			var ch1, ch2, ch3, ch4;
			var pos = 0;
			//过滤非法字符，并去掉'='。
			src = src.replace(/[^A-Za-z0-9\+\/]/g, '');
			//decode the source string in partition of per four characters.
			while (pos + 4 <= src.length) {
				ch1 = this.deKey[src.charCodeAt(pos++)];
				ch2 = this.deKey[src.charCodeAt(pos++)];
				ch3 = this.deKey[src.charCodeAt(pos++)];
				ch4 = this.deKey[src.charCodeAt(pos++)];
				str.push(String.fromCharCode(
					(ch1 << 2 & 0xff) + (ch2 >> 4), (ch2 << 4 & 0xff) + (ch3 >> 2), (ch3 << 6 & 0xff) + ch4));
			}
			//给剩下的字符进行解码。
			if (pos + 1 < src.length) {
				ch1 = this.deKey[src.charCodeAt(pos++)];
				ch2 = this.deKey[src.charCodeAt(pos++)];
				if (pos < src.length) {
					ch3 = this.deKey[src.charCodeAt(pos)];
					str.push(String.fromCharCode((ch1 << 2 & 0xff) + (ch2 >> 4), (ch2 << 4 & 0xff) + (ch3 >> 2)));
				} else {
					str.push(String.fromCharCode((ch1 << 2 & 0xff) + (ch2 >> 4)));
				}
			}
			//组合各解码后的字符，连成一个字符串。
			return str.join('');
		}
	};

	return BASE64;
});