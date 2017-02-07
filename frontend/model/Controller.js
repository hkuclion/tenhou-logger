define(['jquery','model/Side','model/Content'],function ($,Side,Content) {
	return class Controller {
		constructor() {
			this.createView();
			this.createContent();
			this.createSide();

			this.$view.appendTo('body');
		}

		createView(){
			this.$view = $('<div id="controller" />');
		}

		createSide(){
			this.side = new Side({
				before_toggle:(will_be_closed)=>{

				}
			});
			this.$view.append(this.side.$view);
		}

		createContent() {
			this.content = new Content();
			this.$view.append(this.content.$view);
		}
	};
});
