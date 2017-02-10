const {getTenhouMjinfo} = require('../utility/tenhou_path');
const SolParser = require('../utility/SolParser');

class Operation{
	static get_local_sol(){
		let mjinfo_file = getTenhouMjinfo();
		if(!mjinfo_file)return null;

		return SolParser.parse(mjinfo_file);
	}
}

module.exports = Operation;