define(['jquery','./dialog_util','jqueryui','css!./dialog-black.css'],function($, HKUC_DIALOG_UTIL){
	let noOperation = ()=>true;
	let defaults = {
		all:{
			'classes':{
				'ui-dialog':'dialog-black'
			},
			resizable:false,
			minHeight:120,
			align:'center'
		},
		alert:{
			'title':'消息'
		},
		confirm:{
			'title':'确认'
		},
		prompt:{
			'title':'输入'
		},
	};

	class DialogAutoCenter{
		constructor(){
			this.binding = false;
			this.dialogs = new Set();
		}

		add($dialog){
			this.dialogs.add($dialog);
			$dialog.on('dialogclose', ()=>{
				this.remove($dialog);
			});
			this.bindResize();
		}

		remove($dialog){
			this.dialogs.delete($dialog);
			if(!this.dialogs.size()){
				$(window).off('resize.DialogAutoCenter');
			}
		}

		bindResize(){
			if(this.binding)return;
			$(window).on('resize.DialogAutoCenter',()=>{
				this.autoCenter();
			})
		}

		autoCenter(){
			let bodyWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
			let bodyHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			for(let $dialog of this.dialogs){
				let $widget=$dialog.dialog('widget');
				$widget.css({
					'left':Math.max(0,(bodyWidth- $widget.width())/2),
					'top':Math.max(0, (bodyHeight - $widget.height()) / 2),
				})
			}
		}
	}

	let dialog_auto_center = new DialogAutoCenter();


	return class HKUC_DIALOG {
		static alert(message, options = {}) {
			if (typeof options == 'string') {
				options = {title:options};
			}

			options = $.extend(true,{content:message}, defaults.alert, defaults.all, options);
			return this.create(options);
		}

		static confirm(message, options = {}, okCallback = noOperation, cancelCallback = noOperation) {
			if (typeof(options) == 'string') {
				options = {title:options};
			}

			options = $.extend(true,{
				content:message,
				buttons:[
					{
						'text':'确定',
						'class':'ui-dialog-default',
						'click':function(){
							if(okCallback.call(this)!==false){
								HKUC_DIALOG.close(this);
							}
						},
					},
					{
						'text':'取消',
						'click':function () {
							if (cancelCallback.call(this) !== false) {
								HKUC_DIALOG.close(this);
							}
						},
					},
				],
			}, defaults.confirm, defaults.all, options);

			return this.create(options);
		}

		static prompt(message, options = {}, okCallback = noOperation, cancelCallback = noOperation) {
			if (typeof(options) == 'string') {
				options = {title:options};
			}

			let default_value = 'value' in options ? `value ="${HKUC_DIALOG_UTIL.html_encode(options.value)}"` : '';

			options = Object.assign({
				content:message + '<form class="hkuc_dialog_prompt">' +
				`<input type="text" name="prompt[value]" ${default_value} />` +
				'</form>',
				buttons:[
					{
						'text':'确定',
						'class':'ui-dialog-default',
						'click':function () {
							let form_data = HKUC_DIALOG_UTIL.parseSerializeArray($(this).find('form').serializeArray());
							if (okCallback.call(this, form_data.prompt.value) !== false) {
								HKUC_DIALOG.close(this);
							}
						},
					},
					{
						'text':'取消',
						'click':function () {
							if (cancelCallback.call(this) !== false) {
								HKUC_DIALOG.close(this);
							}
						},
					},
				],
			}, defaults.prompt, defaults.all, options);

			let $div = this.create(options);

			$div.find('form').on('submit', () => {
				$div.dialog('widget').find('.ui-dialog-default').trigger('click');
				return false;
			});

			return $div;
		}

		/*
		 HKUC_DIALOG.form([
		 {name:'data[User][username]', type:'text', label:'用户名', value:'hkuc'},
		 {name:'data[User][password]', type:'password', label:'密码'},
		 {
		 name:'data[User][user_group_id]', type:'select', label:'用户组', options:{
		 1:'管理员',
		 2:'普通用户'
		 }, value:2
		 },
		 {name:'data[User][remember]', type:'checker', label:'记住密码', value:'1'},
		 {name:'data[User][content]', type:'textarea', label:'附加信息', value:'a<textarea>b</textarea>c'},
		 ], '登录', (value) => {
		 console.log('确认', value);
		 }, () => {
		 console.log('取消');
		 });
		 */
		static form(message, options = {}, okCallback = noOperation, cancelCallback = noOperation) {
			if (typeof(options) == 'string') {
				options = {title:options};
			}

			if (message instanceof Array) {
				let newForm = '<form class="hkuc_dialog_form"><table>';
				let identifier = 'hkuc_dialog_form' + window.setTimeout(() => {
					}) + '_';
				let field_html = '';
				let form_item_began=false;

				for (let field_info of message) {
					if(field_info instanceof String){
						field_html+=field_info;
						continue;
					}
					else{
						if(!form_item_began){
							field_html+=newForm;
						}
						form_item_began=true;
					}
					if (!field_info.name)continue;
					field_html += '<tr><td class="hkuc_dialog_form_label">' + (field_info.label ? field_info.label : field_info.name) + '</td><td class="hkuc_dialog_form_field">';

					switch (field_info.type) {
						case 'text': {
							let default_value = 'value' in field_info ? `value ="${HKUC_DIALOG_UTIL.html_encode(field_info.value)}"` : '';
							field_html += `<input type="text" ${field_info.disabled ? ' disabled' : ''} ${field_info.readonly ? ' readonly' : ''} name="${field_info.name}" ${default_value} />`;
							break;
						}
						case 'password': {
							let default_value = 'value' in field_info ? `value ="${HKUC_DIALOG_UTIL.html_encode(field_info.value)}"` : '';
							field_html += `<input type="password" ${field_info.disabled ? ' disabled' : ''} ${field_info.readonly ? ' readonly' : ''} name="${field_info.name}" ${default_value} />`;
							break;
						}
						case 'radio':
						case 'checkbox': {
							if (!field_info.options) {
								break;
							}

							for (let key in field_info.options) {
								let default_value = 'value' in field_info && key == field_info.value ? 'checked="checked"' : '';
								let field_index = window.setTimeout(() => {
								});
								field_html += `<span class="hkuc_dialog_form_group"><input type="${field_info.type}" id="${identifier}${field_index}" name="${field_info.name}" value="${HKUC_DIALOG_UTIL.html_encode(key)}" ${default_value} /><label for="${identifier}${field_index}">${field_info.options[key]}</label></span>`;
							}
							break;
						}
						case 'checker': {
							let default_value = 'value' in field_info && field_info.value ? 'checked="checked"' : '';
							field_html += `<input type="hidden" ${field_info.disabled ? ' disabled' : ''} ${field_info.readonly ? ' readonly' : ''} name="${field_info.name}" value="" />`;
							field_html += `<input type="checkbox" ${field_info.disabled ? ' disabled' : ''} ${field_info.readonly ? ' readonly' : ''} name="${field_info.name}" value="1" ${default_value} />`;
						}
						case 'select': {
							if (!field_info.options) {
								break;
							}
							field_html += `<select ${field_info.disabled ? ' disabled' : ''} ${field_info.readonly ? ' readonly' : ''} name="${field_info.name}">`;
							for (let key in field_info.options) {
								let default_value = 'value' in field_info && key == field_info.value ? 'selected="selected"' : '';
								field_html += `<option value="${HKUC_DIALOG_UTIL.html_encode(key)}" ${default_value}>${field_info.options[key]}</option>`;
							}
							field_html += '</select>';
							break;
						}
						case 'textarea': {
							let default_value = 'value' in field_info ? HKUC_DIALOG_UTIL.html_encode(field_info.value) : '';
							field_html += `<textarea ${field_info.disabled ? ' disabled' : ''} ${field_info.readonly ? ' readonly' : ''} name="${field_info.name}">${default_value}</textarea>`;
							break;
						}
						default: {
							field_html += `未处理的类型[${field_info.type}]`;
							break;
						}
					}

					if (field_info.extra) {
						field_html += field_info.extra;
					}

					field_html += '</td></tr>';
				}

				field_html += '</table><input type="submit" style="display: none;" /></form>';
				message = field_html;
			}

			options = Object.assign({
				content:message,
				buttons:[
					{
						'text':'确定',
						'class':'ui-dialog-default',
						'click':function () {
							let form_data = HKUC_DIALOG_UTIL.parseSerializeArray($(this).find('form').serializeArray());
							if (okCallback.call(this, form_data) !== false) {
								HKUC_DIALOG.close(this);
							}
						},
					},
					{
						'text':'取消',
						'click':function () {
							if (cancelCallback.call(this) !== false) {
								HKUC_DIALOG.close(this);
							}
						},
					},
				],
			}, defaults.form, defaults.all, options);

			let $div = this.create(options);

			$div.find('form').on('submit', () => {
				$div.dialog('widget').find('.ui-dialog-default').trigger('click');
				return false;
			});

			return $div;
		}


		static create(options){
			let $div = $('<div class="hkuc_dialog"/>').append(options.content);

			if(options.persist){
				options.classes['ui-dialog']='dialog-black dialog-persist';
				options.closeOnEscape=false;
			}
			$div.css('min-width',120);
			if(options.id)$div.attr('id',options.id);
			$div.dialog(options);

			$div.dialog('option','width','auto');
			if(options.autoCenter){
				dialog_auto_center.add($div);
			}

			return $div;
		}

		static close(id){
			let instance = this.get(id);
			if(!instance)return;

			instance.destroy();
		}

		static hide(id){
			let instance = this.get(id);
			if (!instance)return;

			instance.close();
		}

		static show(id){
			let instance = this.get(id);
			if (!instance)return;

			instance.open();
		}

		static get(id){
			let $div = (id instanceof String)? $('#' + id):$(id);
			return $div.dialog('instance');
		}
	}
});
