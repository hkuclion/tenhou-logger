/**
 * Created by hkuclion on 2017/3/17.
 */
define(['Vue'], function (Vue) {
	return {
		template:`
		<div id="container">
			<actions></actions>
			<source-list></source-list>
		</div>
		`,
		props:[
			'container'
		]
	}
});