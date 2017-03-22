/**
 * Created by hkuclion on 2017/3/17.
 */
define(['class/SerialCall','lib/hkuc/dialog'],function(SerialCall,HKUCDialog){
	return class UserInfo{
		constructor(){
			this.user=null;

			SerialCall.call('user').then((user) => {
				this.setUser(user);
			})
		}

		setUser(user){
			this.user = user;
		}

		logout(){
			HKUCDialog.confirm('确认要退出登录吗？').on('ok',()=>{
				let info_dialog = HKUCDialog.alert('数据提交中，请稍候…', {title:'请等待', persist:true, modal:true});
				SerialCall.call('logout').then((data) => {
					info_dialog.close();

					if (data.result == 'success') {
						this.setUser(false);
						HKUCDialog.alert(data.message, '成功');
					}
					else {
						HKUCDialog.alert(data.message, '失败');
					}
				});
			})
		}

		login(){
			let form_dialog = HKUCDialog.form([
				{label:'用户名', name:'User[username]', type:'text'},
				{label:'密码', name:'User[password]', type:'password'}
			], {
				title:'登录',
				id:'UserInfo_login',
			}).on('ok', (ev, data) => {
				requirejs(['lib/Rsa/RSA'],(RSA)=>{
					data.User.password = RSA.encode(data.User.password);

					let info_dialog = HKUCDialog.alert('数据提交中，请稍候…', {title:'请等待', persist:true, modal:true});
					SerialCall.call('login', data).then((data) => {
						info_dialog.close();

						this.setUser(data.data);
						if (data.result == 'success') {
							form_dialog.close();
							HKUCDialog.alert(data.message, '成功');
						}
						else {
							HKUCDialog.alert('用户名密码错误，请重试！', '错误');
						}
					});
				});

				return false;
			});
		}
	}
});