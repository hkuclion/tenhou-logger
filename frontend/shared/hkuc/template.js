define(['artTemplate','module'], function (artTemplate,module) {
	artTemplate.helper('debug', function (...args) {
		console.debug(
			"%cDEBUG",
			'font-weight:bold; color:#fff; font-family:Consolas; text-shadow: black 0 0 1px,black 0 0 1px,black 0 0 1px,black 0 0 1px;',
			...args
		);
		return '';
	});
	artTemplate.helper('default', function (org,defaultValue) {
		return org === undefined?defaultValue:org;
	});

	let config = Object.assign(
		{
			openTag:'{{',
			closeTag:'}}',
			compress:true,
			escape:true,
		},
		module.config()
	);
	for(let key in config){
		artTemplate.config(key, config[key]);
	}

	artTemplate.onerror = function (e) {
		let message = 'Template Error\n\n';

		for (let name in e) {
			if(name == 'filename' && e[name]=='anonymous')continue;
			message += '<' + name + '>\n' + e[name] + '\n\n';
		}

		message += '<message>\n' + e.message + '\n\n';
		console.error(message);
	};

	let artTemplate_parser = artTemplate.defaults.parser;
	let hkucTemplate_parser = function (code, options) {
		code = code.replace(/^\s/, '');

		let split = code.split(' ');
		let key = split.shift();
		let args = split.join(' ');

		switch (key) {
			case 'for': {
				let index = split[0] || '$index';
				let value = '$dummy';
				let as = 'as';

				let start = split[1] || 0;
				let end = split[2] || 0;
				let step = split[3] || 1;

				code = 'var for_iteration=[]; for(var i=' + start + '; i<' + end + '; i+=' + step + '){ for_iteration.push(i); };';
				let param = value + ',' + index;

				code += '$each(for_iteration,function(' + param + '){';
				return code;
			}
			case 'foreach': {
				args = args.replace(/=>/g, ' => ').replace(/\s+/g, ' ').split(' ');
				let malformed = true;

				let object = args[0] || '$data';
				let as = args[1] || 'as';
				let index = '$index';
				let value = '$value';

				if (as == 'as') {
					if (args.length == 3) {
						index = '$index';
						value = args[2] || '$value';
						malformed = false;
					}
					else if (args.length == 5) {
						if (args[3] == '=>') {
							index = args[2] || '$index';
							value = args[4] || '$value';
							malformed = false;
						}
					}
				}

				if (malformed) {
					throw({
						name:'Syntax Error',
						message:'malformed foreach',
						code:'{' + code + '}'
					});
				}

				let param = value + ',' + index;
				return '$each(' + object + ',function(' + param + '){';
			}
			case '/for':
			case '/foreach': {
				code = '});';
				return code;
			}
			default: {
				return artTemplate_parser(code, options);
			}
		}
	};
	artTemplate.config('parser', hkucTemplate_parser);

	let artTemplate_get = artTemplate.get;
	let hkucTemplate_sources = [];
	let compiled = {};

	class HKUC_TEMPLATE{
		static addSource(source){
			hkucTemplate_sources.push(source);
		}

		static get(template_id){
			if (compiled[template_id]) {
				return compiled[template_id];
			} else if (hkucTemplate_sources.length) {
				for(let source of hkucTemplate_sources){
					if(source.hasOwnProperty(template_id)){
						compiled[template_id] = artTemplate.compile(source[template_id]);
					}
				}

				return compiled[template_id];
			}

			return artTemplate_get(template_id);
		}

		static compile(template_id,template_content){
			compiled[template_id] = artTemplate.compile(template_content);
		}

		static render(template_id,data={}){
			return artTemplate.renderFile(template_id)(data);
		}

		static helper(...args){
			artTemplate.helper(...args);
		}
	}

	artTemplate.get = HKUC_TEMPLATE.get;

	return HKUC_TEMPLATE;
});
