/**
 * Created by hkuclion on 2017/3/17.
 */
define(['class/mainWindow/UserInfo','class/Setting'],function (UserInfo,Setting) {
	return class SideFrame {
		get componentName() {
			return 'side-frame';
		}

		constructor() {
			this.userInfo = new UserInfo();
			this.closed = false;

			this.toggle(Setting.get('sidebar_closed'));
		}

		toggle(closed){
			if (!arguments.length) {
				closed = !this.closed;
				Setting.set('sidebar_closed', closed);
			}
			this.closed = closed;
		}
	}
});