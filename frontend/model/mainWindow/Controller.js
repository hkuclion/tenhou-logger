define(['jquery','model/AsyncReady','model/mainWindow/Side','model/mainWindow/Content'],function ($, AsyncReady,Side,Content) {
	return class Controller extends AsyncReady{
		constructor() {
			super();
			this.createView();
			this.createContent();
			this.createSide();

			this.ready.then(()=>{
				this.$view.appendTo('body');
			})
		}

		createView(){
			this.$view = $('<div id="controller" />');
		}

		createSide(){
			this.side = new Side();
			this.addTask(this.side.ready.then(()=>{
				this.$view.append(this.side.$view);
			}));
		}

		createContent() {
			this.content = new Content();
			this.$view.append(this.content.$view);
		}
	};
});
