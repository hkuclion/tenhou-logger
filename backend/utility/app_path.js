const path = require('path');

let root_path = path.dirname(path.dirname(__dirname));
let backend_path = path.join(root_path, 'backend');
let frontend_path = path.join(root_path, 'frontend');

module.exports = {
	root_path,
	backend_path,
	frontend_path
};