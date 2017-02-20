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
			if(this.user !== user || !this.$view) {
				this.user = user;
				let $last_view = this.$view;
				this.createView();
				if($last_view) {
					$last_view.replaceWith(this.$view);
				}
			}
		}

		createView() {
			if(this.user) {
				this.$view = $(Template.render('logined',{$user:this.user}));
			}
			else{
				this.$view = $(Template.render('not_logined'));
			}
			this.bindEvent();
		}

		bindEvent(){
			if(this.user){
				this.$view.find('#logout').on('click',()=>{
					HKUCDialog.confirm('确认要退出吗？',{id:'UserInfo_logout'},()=>{
						HKUCDialog.alert('数据提交中，请稍候…', {title:'请等待', id:'SerialCall', persist:true, modal:true});
						SerialCall.call('logout').then((data) => {
							HKUCDialog.close('SerialCall');

							if (data.result == 'success') {
								this.setUser(null);
								HKUCDialog.close('UserInfo_logout');
								HKUCDialog.alert(data.message, '成功');
							}
							else {
								HKUCDialog.alert(data.message, '失败');
							}
						});
						return false;
					});
				});
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
						SerialCall.call('login',data).then((data)=>{
							HKUCDialog.close('SerialCall');

							this.setUser(data.data);
							if(data.result=='success'){
								HKUCDialog.close('UserInfo_login');
								HKUCDialog.alert(data.message, '成功');
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
