define(['jquery','hkuc/template','data/templates'],function($,Template,templates){
	Template.compile('side_toggle',templates.side_toggle);

	class Side{
		constructor(delegate){
			Object.assign(this,{
				delegate,
				closed:false,
			});

			this.createView();
		}

		createView(){
			this.$view =$('<aside id="side"/>');

			this.$side_toggle = $(Template.render('side_toggle'));
			this.$side_toggle.on('click', () => {
				this.toggle();
			});

			this.$view.append(this.$side_toggle);
		}

		toggle(){
			this.closed = !this.closed;
			this.delegate.before_toggle(this.closed);
			this.$view.toggleClass('closed', this.closed);
		}
	}

	return Side;
});