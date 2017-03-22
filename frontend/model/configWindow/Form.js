define(['jquery', 'lib/hkuc/template', 'template/configWindow','model/Setting','lib/hkuc/dialog_util'],function($,HKUCTemplate,template,Setting,DialogUtility){
	HKUCTemplate.addSource(template);

	return class Form{
		constructor(){
			this.createView();
		}

		createView(){
			this.$view = $(HKUCTemplate.render('form', {
				$form_fields:{
					'server':{
						label:'服务器',
						type:'radio',
						options:{
							'http://hkuclion.com':'远程',
							'http://local.hkuclion.com':'调试'
						},
						value:Setting.get('server')
					}
				}
			}));

			this.bindEvent();
		}

		bindEvent(){
			this.$view.on('submit',()=>{
				let data = DialogUtility.parseSerializeArray(this.$view.serializeArray());

				Setting.setBulk(data);

				window.close();
				return false;
			})
		}
	}
});
