define(['class/Setting', 'lib/hkuc/dialog'],function(Setting,HKUCDialog){
	let remote = require('electron').remote;
	let path = remote.require('path');
	let fs = remote.require('fs');

	function show_open_file(options) {
		remote.dialog.showOpenDialog(options, (files) => {
			if (files) file_selected(files[0]);
		})
	}

	function file_selected(file) {
		document.querySelector('input[name=file]').value=file;
	}

	return class Container{
		constructor(){
			this.sources = Setting.get('paifu_sources');
			this.default_index = Setting.get('default_paifu_source_index');
			this.selected_index = null;
		}

		setDefaultIndex(index){
			if(index !== this.default_index){
				Setting.set('default_paifu_source_index',index);
				this.default_index = index;
			}
		}

		showAddSource(){
			HKUCDialog.form([
				{
					name:'type',
					type:'radio',
					label:'类型',
					options:{
						'local':'本程序内置Flash',
						'flash':'Flash版',
						'win':'Win版'
					}
				},
				{
					name:'file',
					type:'text',
					label:'文件',
					readonly:true,
					extra:'<button id="selectSource" class="fa fa-file">选择文件</button>'
				},
			], {
				title:'添加牌谱来源',
			}).on('ok', (ev, value) => {
				if (!value.type) {
					HKUCDialog.alert('请选择类型');
					return false;
				}
				if (!value.file) {
					HKUCDialog.alert('请选择文件');
					return false;
				}
				this.addSource(value.type, value.file)
			});

			document.getElementById('selectSource').addEventListener('click',function(){
				let type_radios = document.querySelectorAll('input[type=radio][name=type]');
				let type = null;
				for(let type_radio of type_radios){
					if(type_radio.checked){
						type = type_radio.value;
						break;
					}
				}

				if (!type) {
					return HKUCDialog.alert('请先选择来源类型', {title:'提示'});
				}

				if (type == 'local') {
					file_selected('本程序内置');
				}
				else if (type == 'flash') {
					let shared_object_path = path.resolve(remote.app.getPath('appData'), 'Macromedia', 'Flash Player', '#SharedObjects');

					fs.readdir(shared_object_path, {}, (err, files) => {
						let defaultPath = null;

						if (!err) {
							for (let file of files) {
								if (file.match(/^\w{8}$/)) {
									defaultPath = path.resolve(shared_object_path, file, 'mjv.jp', 'mjinfo.sol');
									break;
								}
							}
						}
						if (!defaultPath) defaultPath = 'mjinfo.sol';

						let options = {
							title:'选择Flash版牌谱',
							defaultPath,
							filters:[{'name':'Flash缓存文件', 'extensions':['sol']}],
							properties:['openFile']
						};

						show_open_file(options);
					});

				}
				else if(type == 'win') {
					let win_cegg_path = path.resolve(path.dirname(remote.app.getPath('temp')), 'C-EGG', 'tenhou');

					fs.readdir(win_cegg_path, {}, (err, files) => {
						let defaultPath;

						if (!err) {
							while (files.length) {
								let file = files.pop();
								if (file.match(/^\d+(\.\d+)?$/)) {
									defaultPath = path.resolve(win_cegg_path, file, 'config.ini');
									break;
								}
							}
						}
						if (!defaultPath) defaultPath = 'config.ini';

						let options = {
							title:'选择Win版牌谱',
							defaultPath,
							filters:[{'name':'Windows配置文件', 'extensions':['ini']}],
							properties:['openFile']
						};

						show_open_file(options);
					});
				}

			})
		}

		addSource(type, file){
			this.sources.push({
				type, file
			});
			Setting.set('paifu_sources',this.sources);
		}

		removeSource(index){
			this.sources.splice(index, 1);
			this.selected_index=null;
			Setting.set('paifu_sources', this.sources);
		}
	}
});
