define(['jquery','artDialog/black','./dialog_util'],function($,artDialog, HKUC_DIALOG_UTIL){
	let stopCancel = () => false;
	let noOperation = () => true;
	let defaults = {
		all:{ 'skin':'artDialog-black' },
		alert:{ id:'alert',ok:true,okValue:'确定' },
		confirm:{ id:'confirm' },
		prompt:{ id:'prompt' },
	};

	Object.assign(artDialog.create.prototype, {
		minWidth(minWidth){
			this.node.style.minWidth = minWidth;
		},
		maxWidth(maxWidth){
			this.node.style.maxWidth = maxWidth;
		}
	});

	return class HKUC_DIALOG{
		static alert(message, options={}) {
			if(typeof options == 'string'){
				options = {title:options};
			}

			options = Object.assign({content:message}, defaults.alert, defaults.all, options);
			return this.create(options);
		}

		static confirm(message,options={}, okCallback = noOperation, cancelCallback = noOperation){
			if(typeof(options) == 'string'){
				options = {title:options};
			}

			options = Object.assign({
				content:message,
				ok:()=>{ return okCallback(); },
				cancel:()=>{ return cancelCallback(); },
				okValue:'确定',
				cancelValue:'取消',
			},defaults.confirm, defaults.all, options);

			return this.create(options);
		}

		static prompt(message,options={}, okCallback = noOperation, cancelCallback = noOperation){
			if(typeof(options) == 'string'){
				options = {title:options};
			}

			let default_value = 'value' in options ? `value ="${HKUC_DIALOG_UTIL.html_encode(options.value)}"` : '';

			options = Object.assign({
				content:message+'<form class="hkuc_dialog_prompt">' +
				`<input type="text" name="prompt[value]" ${default_value} />` +
				'</form>',
				ok:function(){
					let form_data = HKUC_DIALOG_UTIL.parseSerializeArray($(this.node).find('form').serializeArray());
					return okCallback(form_data.prompt.value);
				},
				cancel:() => { return cancelCallback(); },
				okValue:'确定',
				cancelValue:'取消',
			}, defaults.prompt, defaults.all, options);

			let dialog = this.create(options);

			$(dialog.node).find('form').on('submit',()=>{
				$(dialog.node).find('button[i-id=ok]').trigger('click');
				return false;
			});

			return dialog;
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
		static form(message,options={}, okCallback = noOperation, cancelCallback = noOperation){
			if (typeof(options) == 'string') {
				options = {title:options};
			}

			if(message instanceof Array){
				let newForm = '<form class="hkuc_dialog_form"><table>';
				let identifier = 'hkuc_dialog_form'+window.setTimeout(() => {})+'_';

				for(let field_info of message){
					if(!field_info.name)continue;
					let field_html='<tr><td class="hkuc_dialog_form_label">'+(field_info.label? field_info.label: field_info.name)+'</td><td class="hkuc_dialog_form_field">';

					switch(field_info.type){
						case 'text': {
							let default_value = 'value' in field_info?`value ="${HKUC_DIALOG_UTIL.html_encode(field_info.value)}"` : '';
							field_html += `<input type="text" ${field_info.disabled?' disabled':''} ${field_info.readonly ? ' readonly' : ''} name="${field_info.name}" ${default_value} />`;
							break;
						}
						case 'password':{
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
								let field_index = window.setTimeout(() => {});
								field_html += `<span class="hkuc_dialog_form_group"><input type="${field_info.type}" id="${identifier}${field_index}" name="${field_info.name}" value="${HKUC_DIALOG_UTIL.html_encode(key)}" ${default_value} /><label for="${identifier}${field_index}">${field_info.options[key]}</label></span>`;
							}
							break;
						}
						case 'checker':{
							let default_value = 'value' in field_info && field_info.value ? 'checked="checked"' : '';
							field_html += `<input type="hidden" ${field_info.disabled ? ' disabled' : ''} ${field_info.readonly ? ' readonly' : ''} name="${field_info.name}" value="" />`;
							field_html += `<input type="checkbox" ${field_info.disabled ? ' disabled' : ''} ${field_info.readonly ? ' readonly' : ''} name="${field_info.name}" value="1" ${default_value} />`;
						}
						case 'select': {
							if (!field_info.options) {
								break;
							}
							field_html+=`<select ${field_info.disabled ? ' disabled' : ''} ${field_info.readonly ? ' readonly' : ''} name="${field_info.name}">`;
							for (let key in field_info.options) {
								let default_value = 'value' in field_info && key == field_info.value ? 'selected="selected"' : '';
								field_html += `<option value="${HKUC_DIALOG_UTIL.html_encode(key)}" ${default_value}>${field_info.options[key]}</option>`;
							}
							field_html += '</select>';
							break;
						}
						case 'textarea':{
							let default_value = 'value' in field_info ? HKUC_DIALOG_UTIL.html_encode(field_info.value) : '';
							field_html += `<textarea ${field_info.disabled ? ' disabled' : ''} ${field_info.readonly ? ' readonly' : ''} name="${field_info.name}">${default_value}</textarea>`;
							break;
						}
						default:{
							field_html += `未处理的类型[${field_info.type}]`;
							break;
						}
					}

					if(field_info.extra){
						field_html+= field_info.extra;
					}

					field_html+='</td></tr>';
					newForm+=field_html;
				}

				newForm+='</table></form>';
				message = newForm;
			}

			options = Object.assign({
				content:message,
				ok:function () {
					let form_data = HKUC_DIALOG_UTIL.parseSerializeArray($(this.node).find('form').serializeArray());
					return okCallback(form_data);
				},
				cancel:() => {
					return cancelCallback();
				},
				okValue:'确定',
				cancelValue:'取消',
			}, defaults.form, defaults.all, options);

			if(options.extra){
				options.content+=options.extra;
				delete options.extra;
			}

			let dialog = this.create(options);

			$(dialog.node).find('form').on('submit', () => {
				$(dialog.node).find('button[i-id=ok]').trigger('click');
				return false;
			});

			return dialog;
		}

		static setDefault(...args){
			let type,options,extend;

			if(args.length >= 3){
				[type,options,extend] = args;
			}
			else if(args.length == 2){
				if(typeof args[1] == 'boolean'){
					type = 'all';
					[options,extend] = args;
				}
				else{
					[type,options] = args;
					extend = true;
				}
			}
			else if(args.length == 1){
				type = 'all';
				[options] = args;
				extend = true;
			}
			else{
				return;
			}

			if(extend){
				Object.assign(defaults[type],options);
			}
			else{
				defaults[type] = options;
			}
		}

		static getDefault(type = 'all'){
			return defaults[type];
		}

		static create(options){
			let {modal,persist} = options;
			if(persist){
				if(!options.cancel){
					options.cancel = stopCancel;
				}
				options.cancelDisplay = false;
				if(!options.skin)options.skin='persist';
				else options.skin+=' persist';
			}

			let dialog = artDialog(options);

			modal? dialog.showModal(): dialog.show();

			return dialog;
		}

		static hide(id = null) {
			let dialog = this.get(id);

			if (dialog) {
				dialog.close();
			}
		}

		static show(id = null){
			let dialog = this.get(id);

			if (dialog) {
				dialog.show();
			}
		}

		static close(id = null) {
			let dialog = this.get(id);

			if (dialog) {
				dialog.remove();
			}
		}

		static get(id = null) {
			if (id === null) {
				return artDialog.getCurrent();
			}
			if (typeof id == 'string' || typeof id == 'number') {
				return artDialog.get(id);
			}
			if (typeof id == 'object' && id.close) {
				return id;
			}
			return null;
		}
	};


});
