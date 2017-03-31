define({
	side_toggle:`
      <a id="side_toggle">
        <i class="fa fa-dedent"></i>
        <i class="fa fa-indent"></i>
      </a>
	`,
	not_logined:`
		<div id="user_info">
			<div class="not_logined">
				<a id="login" class="button fa fa-user"></a>
				<a id="register" class="button fa fa-address-card"></a>
			</div>
		</div>
	`,
	logined:`
		<div id="user_info">
			欢迎登录：<a rel='goSite'>{{$user.username}}<span class="arrow"></span></a>，<a id="logout">退出登录</a></li>
		</div>
	`,
	paifu:`
		<li>
		<span class="date">
			<i class="year">{{$paifu.date.substr(0,5)}}</i>
			<i>{{$paifu.date.substr(5)}}</i>
		</span>
		<span class="delimiter">&nbsp;|&nbsp;</span>
		<span class="type">{{paifu.constructor.typeToString(paifu.type)}}</span>
		<span class="delimiter">&nbsp;|&nbsp;</span>
		<span class="url">{{$paifu.url}}</span>
		<span class="line_break"><br /></span>
		<span class="rank">{{$paifu.rank}}位</span>
		{{foreach $paifu.un as $index=>$user}}
		{{if $user}}
		<span class="delimiter">&nbsp;</span>
		{{'',$score=$paifu.sc[$index * 2 + 1]}}
		<span class="user">{{$user}}<span class="ten">({{$score>=0?"+":""}}{{$score}}{{if $paifu.sc.length>8}},{{$paifu.sc[$index * 2+ 8]}}枚{{/if}})</span></span>
		{{/if}}
		{{/foreach}}
		</li>
	`,
	paifu_text:`{{$paifu.date}} | {{$helpers.typeToString($paifu.type)}} | {{$paifu.url}}
{{$paifu.rank}}位{{foreach $paifu.un as $index=>$user}}{{if $user}} {{'',$score=$paifu.sc[$index * 2 + 1]}}{{$user}}({{$score>=0?"+":""}}{{$score}}{{if $paifu.sc.length>8}},{{$paifu.sc[$index * 2+ 8]}}枚{{/if}}){{/if}}{{/foreach}}`,
});
