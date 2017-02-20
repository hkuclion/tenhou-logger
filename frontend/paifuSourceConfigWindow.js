requirejs(['model/Setting','jquery','lib/hkuc/dialog'], function (Setting,$, HKUCDialog) {
	let remote= require('electron').remote;
	let path = remote.require('path');
	let fs = remote.require('fs');

	let current_paifu_sources;
	let default_paifu_source_index = -1;
	let $list;

	$(document).ready(()=>{
		$list = $('#source_list').find('ul.list');

		$('#add_source').on('click',function(){
			HKUCDialog.form([
				{name:'type', type:'radio', label:'类型', options:{
					'local':'本程序内置Flash',
					'flash':'Flash版',
					'win':'Win版'
				}},
				{name:'file', type:'text', label:'文件', readonly:true,extra:'<a id="selectSource" class="button fa fa-file" style="padding-top:2px; padding-bottom:2px">选择文件</a>'},
			],{
				title:'添加牌谱来源',
			},(value)=>{
				if(!value.type){
					HKUCDialog.alert('请选择类型');
					return false;
				}
				if(!value.file){
					HKUCDialog.alert('请选择文件');
					return false;
				}
				add_source(value.type,value.file);
			});

			$('#selectSource').click(function(){
				let $selected = $(this).closest('form').find('input[type=radio][name=type]:checked');

				if(!$selected.length){
					return HKUCDialog.alert('请先选择来源类型',{title:'提示'});
				}

				let type = $selected.val();

				if(type == 'local'){
					file_selected('本程序内置');
				}
				else{
					if(type == 'flash'){
						let shared_object_path = path.resolve(remote.app.getPath('appData'), 'Macromedia', 'Flash Player', '#SharedObjects');

						fs.readdir(shared_object_path,{},(err,files)=>{
							let defaultPath=null;

							if(!err){
								for(let file of files){
									if(file.match(/^\w{8}$/)){
										defaultPath = path.resolve(shared_object_path, file,'mjv.jp','mjinfo.sol');
										break;
									}
								}
							}
							if(!defaultPath)defaultPath= 'mjinfo.sol';

							let options = {
								title:'选择Flash版牌谱',
								defaultPath,
								filters:[{'name':'Flash缓存文件', 'extensions':['sol']}],
								properties:['openFile']
							};

							show_open_file(options);
						});


					}
					else{
						let win_cegg_path = path.resolve(remote.app.getPath('appData'), 'C-EGG', 'tenhou');

						fs.readdir(win_cegg_path, {}, (err, files) => {
							let defaultPath;

							if (!err) {
								while(files.length){
									let file = files.pop();
									if(file.match(/^\d+\.\d+$/)){
										defaultPath = path.resolve(shared_object_path, file, 'config.ini');
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
				}
			})
		});

		$('#remove_source').on('click', function () {
			let $selected = $list.children('li.selected');
			if(!$selected.length)return false;

			let index = $selected.index();
			current_paifu_sources.splice(index,1);
			Setting.set('paifu_sources', current_paifu_sources);
			show_paifu_sources(current_paifu_sources);
		});

		$('#set_default').on('click', function () {
			let $selected = $list.children('li.selected');
			if (!$selected.length)return false;

			let index = $selected.index();
			if(default_paifu_source_index == index){
				index = -1;
			}

			default_paifu_source_index = index;
			Setting.set('default_paifu_source_index', index);
			show_paifu_sources(current_paifu_sources);
		});

		$list.on('click','li',function(){
			$(this).toggleClass('selected').siblings().removeClass('selected');
		});

		Setting.initialize().then(() => {
			current_paifu_sources = Setting.get('paifu_sources');
			if (!current_paifu_sources) current_paifu_sources = [];

			default_paifu_source_index = Setting.get('default_paifu_source_index');
			if(typeof default_paifu_source_index != 'number' ){
				default_paifu_source_index = -1;
			}

			show_paifu_sources(current_paifu_sources);
		});
	});

	function show_open_file(options){
		remote.dialog.showOpenDialog(options, (files) => {
			if (files) file_selected(files[0]);
		})
	}

	function file_selected(file){
		$('#selectSource').closest('form').find('input[name=file]').val(file);
	}

	function add_source(type,file){
		current_paifu_sources.push({
			type,file
		});

		Setting.set('paifu_sources',current_paifu_sources).then(()=>{
			show_paifu_sources(current_paifu_sources);
		});
	}

	function show_paifu_sources(paifu_sources){
		if(!Array.isArray(paifu_sources))paifu_sources = [];
		$list.empty();

		let index = 0;
		for(let paifu_source of paifu_sources){
			$list.append(`<li ${index++ == default_paifu_source_index?'class="default"':''} data-type="${paifu_source.type}" title="${paifu_source.file}">${paifu_source.file}</li>`);
		}
	}
});