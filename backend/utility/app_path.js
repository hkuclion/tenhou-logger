const {app} = require('electron');
const path = require('path');

let root_path = app.getAppPath();
let backend_path = path.join(root_path, 'backend');
let frontend_path = path.join(root_path, 'frontend');

module.exports = {
	root_path,
	backend_path,
	frontend_path
};