/**
 * Created by hkuclion on 2017/4/1.
 */
define(['Vue'], function (Vue) {
	return {
		template:`
		<ul class="list" id="source_list">
			<li v-for="(source,index) in sources"
				:class="{default:index===default_index, selected:index === selected_index}"
				:data-type="source.type"
				:title="source.file"
				@click="select(index)"
				@dblclick="setDefault(index)"
				>{{source.file}}</li>
		</ul>
		`,
		props:[
			'sources',
			'default_index',
			'selected_index',
		],
		methods:{
			select:function(index){
				this.$emit('select',this.selected_index === index?null:index);
			},
			setDefault:function(index){
				if(index !==this.default_index){
					this.$emit('default',index);
				}
			}
		}
	}
});