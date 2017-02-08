define(['jquery'], function ($) {
	class Content {
		constructor() {
			this.closed = false;
			this.createView();
		}

		createView() {
			this.$view = $('<article id="content" />');
		}
	}

	return Content;
});