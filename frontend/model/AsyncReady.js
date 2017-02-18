define(function(){
	let Symbol_ready = Symbol('ready');
	let Symbol_resolve = Symbol('resolve');
	let Symbol_task = Symbol('task');
	let Symbol_task_finish = Symbol('task_finish');

	return class AsyncReady{
		constructor(){
			this[Symbol_ready]=new Promise((resolve,reject)=>{
				this[Symbol_resolve] = resolve;
			});
			this[Symbol_task]=new Set();
		}

		get ready(){
			return this[Symbol_ready];
		}

		addTask(promise){
			if(!this[Symbol_task])return;
			this[Symbol_task].add(promise);
			promise.then(()=>{
				this[Symbol_task_finish](promise);
			})
		}

		[Symbol_task_finish](promise){
			this[Symbol_task].delete(promise);
			if(!this[Symbol_task].size){
				this[Symbol_resolve]();
				this[Symbol_resolve] = null;
				this[Symbol_task] = null;
			}
		}
	}
});
