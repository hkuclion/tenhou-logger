/**
 * Created by hkuclion on 2017/3/17.
 */
define(['class/mainWindow/MainFrame', 'class/mainWindow/SideFrame'],function(MainFrame, SideFrame){
	return class Container{
		get componentName() {
			return 'container';
		}

		constructor(){
			this.mainFrame = new MainFrame();
			this.sideFrame = new SideFrame();
		}
	}
});