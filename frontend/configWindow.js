requirejs(['Vue','class/configWindow/Container'], function (Vue, Container) {
	let root_dom = document.createElement('div');
	document.body.appendChild(root_dom);

	Vue.component('container', function (resolve, reject) {
		requirejs(['component/configWindow/container'], resolve);
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