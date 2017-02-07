define(function () {
	class SerializeArray {
		constructor(data) {
			this.value = {};

			for (let {name, value} of data) {
				let parts = name.split(/\[|\]\[|\]/);
				if (parts.length > 1) parts.pop();
				this.setValue(parts, value);
			}

			return SerializeArray.normalize(this.value);
		}

		setValue(full_paths, value) {
			let paths = full_paths.slice();
			let key = paths.pop();

			let current = this.getValue(paths);

			if (!(current instanceof Object)) {
				current = {};
				this.setValue(paths, current);
			}

			if (key === '') {
				key = SerializeArray.nextIndex(current);
			}

			current[key] = value;
		}

		getValue(full_paths) {
			let current = this.value;
			for (let i = 0; i < full_paths.length; i++) {
				if (!(i == full_paths.length - 1 || current[full_paths[i]] instanceof Object)) {
					current[full_paths[i]] = {};
				}
				current = current[full_paths[i]];
			}

			return current;
		}

		static normalize(current) {
			for (let key in current) {
				if (current[key] instanceof Object) {
					current[key] = this.normalize(current[key]);
				}
			}

			let keys = Object.keys(current);
			let numeric_keys = keys.filter((key) => key.match(/^\d+$/));

			if (keys.length == numeric_keys.length) {
				numeric_keys.sort((a, b) => a - b);

				let newArray = [];
				for (let i = 0; i < numeric_keys.length; i++) {
					if (i.toString() != numeric_keys[i])return current;
					newArray.push(current[numeric_keys[i]]);
				}

				return newArray;
			}

			return current;
		}

		static nextIndex(obj) {
			let keys = Object.keys(obj);
			let max_key = Math.max(...keys.filter((key) => key.match(/^\d+$/)).sort((a, b) => Number(a) - Number(b)));

			return max_key == Number.NEGATIVE_INFINITY ? "0" : (Number(max_key) + 1).toString();
		}
	}

	return class HKUC_DIALOG_UTIL {
		static nl2br(str) {
			return typeof str == 'string' ? str.replace(/\r?\n/g, '<br />') : str;
		}

		static parseSerializeArray(array) {
			return new SerializeArray(array);
		}

		static html_encode(str){
			return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
		}

		static html_decode(str){
			return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"");
		}
	};
});
