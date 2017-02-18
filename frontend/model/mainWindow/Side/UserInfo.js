define(
	['jquery', 'lib/hkuc/template', 'template/mainWindow','lib/hkuc/dialog','model/AsyncReady','model/SerialCall','lib/Rsa/RSA'],
	function ($, Template, templates, HKUCDialog, AsyncReady, SerialCall, RSA) {
	Template.compile('not_logined', templates.not_logined);
	Template.compile('logined', templates.logined);

	class UserInfo extends AsyncReady{
		constructor() {
			super();
			this.user=undefined;

			this.addTask(SerialCall.call('user').then((user) => {
				this.setUser(user);
			}));
		}

		setUser(user){
			if(this.user !== user) {
				this.user = user;
				if (this.$view){
					this.$view.remove();
				}
				this.createView();
				this.bindEvent();
			}
		}

		createView() {
			if(this.user) {
				this.$view = $(Template.render('logined',{$user:this.user}));
			}
			else{
				this.$view = $(Template.render('not_logined'));
			}
		}

		bindEvent(){
			if(this.user){

			}
			else{
				this.$view.find('#login').on('click',()=>{
					HKUCDialog.form([
						{label:'用户名',name:'User[username]',type:'text'},
						{label:'密码',name:'User[password]',type:'password'}
					],{
						title:'登录',
						id:'UserInfo_login'
					},(data)=>{
						data.User.password= RSA.encode(data.User.password);

						HKUCDialog.alert('数据提交中，请稍候…',{title:'请等待',id:'SerialCall',persist:true,modal:true});
						SerialCall.call('login',data).then(({result, message, data})=>{
							HKUCDialog.close('SerialCall');

							this.setUser(data);
							if(result=='success'){
								HKUCDialog.close('UserInfo_login');
								HKUCDialog.alert(message, '成功');
							}
							else{
								HKUCDialog.alert('用户名密码错误，请重试！','错误');
							}
						});
						return false;
					})
				});
			}
		}
	}

	return UserInfo;
});
