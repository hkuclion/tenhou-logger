requirejs(['jquery','model/configWindow/Form'], function ($,Form) {
	let form = new Form();

	$(document.body).append(form.$view);
});