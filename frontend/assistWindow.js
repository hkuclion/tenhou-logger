requirejs(['Vue','class/assistWindow/Dispatcher'], function (Vue, Dispatcher) {
	let root_dom = document.createElement('div');
	document.body.appendChild(root_dom);

	Vue.component('dispatcher', function (resolve, reject) {
		requirejs(['component/assistWindow/dispatcher'], resolve);
	});

	let dispatcher = new Dispatcher();

	let vue = new Vue({
		el:root_dom,
		template:`<dispatcher :Dispatcher="dispatcher"></dispatcher>`,
		data:{
			dispatcher
		},
	});

	/*let simulation_data = [];
	let TO_INDEX = 145;
	const INTERVAL = 100;
	let parser = new DOMParser();

	let sendCommand=()=>{
		if(TO_INDEX <=0 || simulation_data.length<=0) {
			console.log(simulation_data[0]);
			return;
		}TO_INDEX--;

		let data = simulation_data.shift();
		let node = parser.parseFromString(data, 'application/xml').documentElement;
		let command = {
			tag:node.tagName
		};

		for (let i = 0; i < node.attributes.length; i++) {
			command[node.attributes[i].name] = node.attributes[i].value;
		}

		dispatcher.command(command);
		setTimeout(sendCommand, INTERVAL)
	};

	//sendCommand();*/
});