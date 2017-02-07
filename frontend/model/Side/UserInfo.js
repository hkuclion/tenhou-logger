define(['jquery', 'hkuc/template', 'data/templates'], function ($, Template, templates) {
	Template.compile('not_logined', templates.not_logined);
	//Template.compile('logined', templates.logined);
	//Template.compile('login_form', templates.login_form);

	class UserInfo {
		constructor(delegate) {
			Object.assign(this, {
				delegate,
				closed:false,
			});

			this.createView();
		}

		createView() {
			this.$view = $('<aside id="side"/>');

			this.$side_toggle = $(Template.render('side_toggle'));
			this.$side_toggle.on('click', () => {
				this.toggle();
			});

			this.$view.append(this.$side_toggle);
		}

		toggle() {
			this.closed = !this.closed;
			this.delegate.before_toggle(this.closed);
			this.$view.toggleClass('closed', this.closed);
		}
	}

	return Side;
});
