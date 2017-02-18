define(['lib/Rsa/Barrett','lib/Rsa/BigInt'],function(BarrettModule, BigIntModule) {
	const {BigInt,biFromHex, biHighIndex, setMaxDigits, biToHex}=BigIntModule;
	const {BarrettMu} = BarrettModule;
// RSA, a suite of routines for performing RSA public-key computations in
// JavaScript.
//
// Requires BigInt.js and Barrett.js.
//
// Copyright 1998-2005 David Shapiro.
//
// You may use, re-use, abuse, copy, and modify this code to your liking, but
// please keep this header.
//
// Thanks!
// 
// Dave Shapiro
// dave@ohdave.com 

	function RSAKeyPair(encryptionExponent, decryptionExponent, modulus) {
		this.e = biFromHex(encryptionExponent);
		this.d = biFromHex(decryptionExponent);
		this.m = biFromHex(modulus);
		// We can do two bytes per digit, so
		// chunkSize = 2 * (number of digits in modulus - 1).
		// Since biHighIndex returns the high index, not the number of digits, 1 has
		// already been subtracted.
		this.chunkSize = 2 * biHighIndex(this.m);
		this.radix = 16;
		this.barrett = new BarrettMu(this.m);
	}

	function twoDigit(n) {
		return (n < 10 ? "0" : "") + String(n);
	}

	function encryptedString(key, s)
	// Altered by Rob Saunders (rob@robsaunders.net). New routine pads the
	// string after it has been converted to an array. This fixes an
	// incompatibility with Flash MX's ActionScript.
	{
		var a = new Array();
		var sl = s.length;
		var i = 0;
		while (i < sl) {
			a[i] = s.charCodeAt(i);
			i++;
		}

		while (a.length % key.chunkSize != 0) {
			a[i++] = 0;
		}

		var al = a.length;
		var result = "";
		var j, k, block;
		for (i = 0; i < al; i += key.chunkSize) {
			block = new BigInt();
			j = 0;
			for (k = i; k < i + key.chunkSize; ++j) {
				block.digits[j] = a[k++];
				block.digits[j] += a[k++] << 8;
			}
			var crypt = key.barrett.powMod(block, key.e);
			var text = key.radix == 16 ? biToHex(crypt) : biToString(crypt, key.radix);
			result += text + " ";
		}
		return result.substring(0, result.length - 1); // Remove last space.
	}

	function decryptedString(key, s) {
		var blocks = s.split(" ");
		var result = "";
		var i, j, block;
		for (i = 0; i < blocks.length; ++i) {
			var bi;
			if (key.radix == 16) {
				bi = biFromHex(blocks[i]);
			}
			else {
				bi = biFromString(blocks[i], key.radix);
			}
			block = key.barrett.powMod(bi, key.d);
			for (j = 0; j <= biHighIndex(block); ++j) {
				result += String.fromCharCode(block.digits[j] & 255,
					block.digits[j] >> 8);
			}
		}
		// Remove trailing null, if any.
		if (result.charCodeAt(result.length - 1) == 0) {
			result = result.substring(0, result.length - 1);
		}
		return result;
	}

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

	let RSA_key=null;

	return class RSA{
		static initialize(rsa_n = "F62A39E33425AAF2EA4E699BFD7E44192CB9FA6D796B84A55FDCEE4679AB359EA00869140783E6640D01BEAB08422C9414FDD9766C71055A6B5E73AD7A006B8F404D0B4BD2F2EDECE03E6A9EA486AC2EA33A42A6D8D280944B5181877E41D7879A6FE62F61B26C34A944872AC3DE0A03BB6FE01FB61C21EC01D2E87D42E2CFBF",maxDigit=131){
			setMaxDigits(maxDigit);
			RSA_key = new RSAKeyPair("10001", '', rsa_n);
		}

		static encode(data){
			if(!RSA_key)this.initialize();
			return hex2b64(encryptedString(RSA_key, data));
		}
	}
});