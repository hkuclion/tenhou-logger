/**
 * Created by hkuclion on 2017/4/1.
 */
define(['Vue'], function (Vue) {
	return {
		template:`
		<div id="operation">
			<button role="add_source" @click="add_source" class="fa fa-plus"></button>
			<button role="remove_source" @click="remove_source" class="fa fa-minus" :disabled="selected_index===null"></button>
			<button role="set_default" @click="set_default" class="fa fa-check-square-o" :disabled="selected_index===null || default_index===selected_index"></button>
		</div>
		`,
		props:[
			'default_index',
			'selected_index',
		],
		methods:{
			add_source:function () {
				this.$emit('add')
			},
			remove_source:function () {
				this.$emit('remove', this.selected_index)
			},
			set_default:function () {
				this.$emit('default',this.selected_index);
			},
		}
	}
});