window.get_logs = function (){
	let index = 0;

	let logs = [];
	let log;
	while(log = localStorage.getItem('log'+index++)){
		logs.push(JSON.parse(log));
	}

	let next_index = parseInt(localStorage.getItem('lognext'));
	return logs.slice(next_index).concat(logs.slice(0,next_index));
};