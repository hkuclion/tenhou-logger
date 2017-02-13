define(['jquery','hkuc/template','data/templates','shared/manager/Setting'],function($,Template,templates, Setting){
	Template.compile('side_toggle',templates.side_toggle);

	class Side{
		constructor(){
			Object.assign(this,{
				closed:false,
			});

			this.createView();

			this.toggle(Setting.get('sidebar_closed'));
		}

		createView(){
			this.$view =$('<aside id="side"/>');

			this.$side_toggle = $(Template.render('side_toggle'));
			this.$side_toggle.on('click', () => {
				this.toggle();
			});

			this.$view.append(this.$side_toggle);
		}

		toggle(closed){
			if(!arguments.length){
				closed = !this.closed;
			}
			this.closed = closed;

			this.$view.toggleClass('closed', this.closed);
			if (!arguments.length) {
				Setting.set('sidebar_closed', this.closed);
			}
		}
	}

	return Side;
});