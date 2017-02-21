let fs = require('fs');

function parseIni(buffer){
	let parsed = [];
	let QueryString = require("querystring");
	let sections = QueryString.parse(buffer, '[', ']');
	for(let section of Object.keys(sections)){
		if(section == '')continue;
		parsed [section] = [];
		let rows = QueryString.parse(sections[section], '\r\n', '=');
		for(let key of Object.keys(rows)){
			if(key == '')continue;
			parsed[section][key] = rows[key];
		}
	}
	return parsed;
}

class IniParser{
	static parse(file){
		if (!fs.existsSync(file))return null;
		let buffer = fs.readFileSync(file,'ascii');
		return parseIni(buffer);
	}
}

module.exports = IniParser;

