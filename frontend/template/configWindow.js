define({
	form:`
		<form>
			<dl>
			{{foreach $form_fields as $field=>$field_info}}
				<dt>
					<label for="{{$field_info.name}}">{{$field_info.label}}</label>
				</dt>
				<dd>
				{{include 'form_elem_'+$field_info.type {name:$field,value:$field_info.value,options:$field_info.options}	}}
				</dd>
			{{/foreach}}
			</dl>
			<input type="submit" />
		</form>
	`,
	form_elem_text:`
		<input type="text" id="{{$data.name}}" name="{{$data.name}}" {{if $data.value}}value="{{$data.value}}"{{/if}} />
	`,
	form_elem_radio:`
		{{foreach $data.options as $key=>$display}}
		<span class="hkuc_dialog_form_group"><input type="radio" id="{{$data.name}}_{{$key}}" name="{{$data.name}}" value="{{$key}}" {{if $data.value == $key}} checked="checked"{{/if}} /><label for="{{$data.name}}_{{$key}}">{{$display}}</label></span>
		{{/foreach}}
	`,
});