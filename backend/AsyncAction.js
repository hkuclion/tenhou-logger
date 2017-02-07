const {ipcMain,dialog} = require('electron');
const ElectronSettings = require('electron-settings');

class AsyncAction{
	static async getLocalPaifu(){
		let paifu_sources = await AsyncAction.getPaifuSources();
		let paifu_source = await AsyncAction.selectPaifuSource(paifu_sources);

		if (!paifu_source){
			dialog.showMessageBox({message:"您没有选择牌谱来源"});
			return false;
		}
		dialog.showMessageBox({message:"牌谱来源:"+paifu_source});
	}
	static async getPaifuSources() {
		if (!await ElectronSettings.has('paifu_sources')) {
			let paifu_sources = await AsyncAction.wait('set_paifu_source');
			if (!paifu_sources)return null;
			await ElectronSettings.set('paifu_sources', paifu_sources);
		}
		return ElectronSettings.get('paifu_sources');
	}
	static async selectPaifuSource(paifu_sources) {
		if (!paifu_sources)return null;

		if (!await ElectronSettings.has('paifu_source')) {
			let paifu_source;
			if (paifu_sources.length == 1) {
				paifu_source = paifu_sources[0];
			}
			else {
				paifu_source = await AsyncAction.wait('select_paifu_source', paifu_sources);
			}
			if(!paifu_source) return null;
			await ElectronSettings.set('paifu_source', paifu_source);
		}
		return ElectronSettings.get('paifu_source');
	}

	static async clearSetting(){
		await ElectronSettings.clear();

		AsyncAction.send('setting_cleared');
	}

	static send(remote_action, ...args){
		global.mainWindow.webContents.send(remote_action, ...args);
	}

	static wait(remote_action,...args) {
		AsyncAction.send(remote_action, ...args);

		let last_wait = waits.get(remote_action);
		if (last_wait) last_wait.reject();

		return new Promise((resolve,reject)=>{
			waits.set(remote_action, {resolve, reject});
		});
	}

	static resolve(remote_action, ...result) {
		let wait = waits.get(remote_action);

		if (wait) {
			waits.delete(remote_action);
			wait.resolve(...result);
		}
	}

	static reject(remote_action, ...result) {
		let wait = waits.get(remote_action);
		if (wait) {
			waits.delete(remote_action);
			wait.reject(...result);
		}
	}
}

let waits = new Map();

ipcMain.on('set_paifu_source',function(event,arg){
	AsyncAction.resolve('set_paifu_source', arg);
});

ipcMain.on('select_paifu_source', function (event, arg) {
	AsyncAction.resolve('select_paifu_source', arg);
});

module.exports = AsyncAction;

