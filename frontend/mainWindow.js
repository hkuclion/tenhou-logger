requirejs(['Vue','class/mainWindow/Container'], function (Vue,Container) {
	let root_dom = document.createElement('div');
	document.body.appendChild(root_dom);

	Vue.component('container', function (resolve, reject) {
		requirejs(['component/mainWindow/container'], resolve);
	});

	let container = new Container();

	let vue = new Vue({
		el:root_dom,
		template:`<container :container="container"></container>`,
		data:{
			container
		},
	});
});
requirejs(['lib/hkuc/dialog', 'class/SerialCall'], function (HKUCDialog, SerialCall) {
	SerialCall.on('REVIEW_PAIFU',()=>{
		let prompt_dialog = HKUCDialog.prompt('请输入牌谱地址').on('ok', (ev, url) => {
			let matched;
			if (!(matched = url.match(/^http:\/\/tenhou\.net\/0\/\?log=(\d{10}gm-([0-f]{4})-[0-f]+-(?:x[0-f]{12}|[0-f]{8})\&tw=\d)$/i))) {
				if (url.match(/^http:\/\/tenhou.net\/0\/\?wg=[0-f]+(&tw=\d)?/i)) {
					SerialCall.call('WATCH_GAME', url);
					return;
				}

				HKUCDialog.alert('牌谱地址格式不正确');
				return false;
			}

			SerialCall.call('REVIEW_PAIFU', url);
		})
	});
});