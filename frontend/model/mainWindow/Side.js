define(
	['jquery', 'lib/hkuc/template', 'template/mainWindow', 'model/AsyncReady', 'model/Setting', 'model/mainWindow/Side/UserInfo'],
	function ($, Template, templates, AsyncReady, Setting, UserInfo) {
		Template.compile('side_toggle', templates.side_toggle);

		return class Side extends AsyncReady{
			constructor(){
				super();
				Object.assign(this, {
					closed:false,
				});

				this.createView();
				this.createUserInfo();
			}

			createView(){
				this.$view = $('<aside id="side"/>');

				this.$side_toggle = $(Template.render('side_toggle'));
				this.$side_toggle.on('click', () => {
					this.toggle();
				});

				this.$view.append(this.$side_toggle);
				this.addTask(Setting.ready.then(()=>{
					this.toggle(Setting.get('sidebar_closed'));
				}));
			}

			createUserInfo(){
				this.user_info = new UserInfo();
				this.addTask(this.user_info.ready.then(()=>{
					this.$view.append(this.user_info.$view);
				}));
			}

			toggle(closed){
				if (!arguments.length) {
					closed = !this.closed;
				}
				this.closed = closed;

				this.$view.toggleClass('closed', this.closed);
				if (!arguments.length) {
					Setting.set('sidebar_closed', this.closed);
				}
			}
		}
	});