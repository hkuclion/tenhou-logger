const{app} = require('electron');
const path = require('path');
const fs = require('fs');

let tenhou_flash_cache_dir = null;
function getTenhouFlashCacheDir() {
	if (tenhou_flash_cache_dir)return tenhou_flash_cache_dir;

	const flash_shared_object_path = path.resolve(
		app.getPath('userData'),
		'Pepper Data',
		'Shockwave Flash',
		'WritableRoot',
		'#SharedObjects'
	);

	if (fs.existsSync(flash_shared_object_path)) {
		let files = fs.readdirSync(flash_shared_object_path);
		for (let file of files) {
			if (file.match(/^\w{8}$/)) {
				tenhou_flash_cache_dir = path.resolve(flash_shared_object_path, file, 'mjv.jp');
				return tenhou_flash_cache_dir;
			}
		}
	}

	return null;
}
function getTenhouMjinfo() {
	let tenhou_flash_cache_dir = getTenhouFlashCacheDir();
	if (!tenhou_flash_cache_dir)return null;
	let mjinfo = path.resolve(tenhou_flash_cache_dir, 'mjinfo.sol');
	if (fs.existsSync(mjinfo))return mjinfo;
	return null;
}
function getTenhouMjstatus() {
	let tenhou_flash_cache_dir = getTenhouFlashCacheDir();
	if (!tenhou_flash_cache_dir)return null;
	let mjinfo = path.resolve(tenhou_flash_cache_dir, 'mjstatus.sol');
	if (fs.existsSync(mjinfo))return mjinfo;
	return null;
}

module.exports.getTenhouMjinfo = getTenhouMjinfo;
module.exports.getTenhouMjstatus = getTenhouMjstatus;