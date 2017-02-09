class WindowManager{
	static getWindow(name){
		if(!windows.has(name)){
			let newWindow = require(`./${name}Window/creator.js`)();
			newWindow.on('closed', () => {
				WindowManager.deleteWindow(name);
			});
			windows.set(name, newWindow);
			return newWindow;
		}
		let window = windows.get(name);
		window.focus();
		return window;
	}

	static deleteWindow(name){
		windows.delete(name);
	}
}

let windows = new Map();

module.exports = WindowManager;
