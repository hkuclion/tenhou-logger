const {app} = require('electron');
const path = require('path');
const fs = require('fs');

const {execSync} = require('child_process');
let system32_path = execSync('echo %SYSTEMROOT%\\System32', {encoding:"utf8"}).trim();
let flash_path = path.resolve(system32_path, 'Macromed', 'Flash');

if (fs.existsSync(flash_path)) {
	let files = fs.readdirSync(flash_path);
	let ppapi_flash_path = null;
	let ppapi_flash_version = null;

	for (let file of files) {
		let matches;
		if (matches = file.match(/pepflashplayer64_(\d+)_(\d+)_(\d+)_(\d+).dll/)) {
			ppapi_flash_path = path.resolve(flash_path, file);
			ppapi_flash_version = `${matches[1]}.${matches[2]}.${matches[3]}.${matches[4]}`;
		}
	}
	if (fs.existsSync(ppapi_flash_path)) {
		app.commandLine.appendSwitch('--enable-npapi');
		app.commandLine.appendSwitch('ppapi-flash-path', ppapi_flash_path);
		app.commandLine.appendSwitch('ppapi-flash-version', ppapi_flash_version);
	}
}