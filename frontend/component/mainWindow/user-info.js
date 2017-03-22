/**
 * Created by hkuclion on 2017/3/17.
 */
define(['Vue'], function (Vue) {

	return {
		template:`
		<div id="user_info">
			<template v-if="userInfo.user===null">
			  登录状态同步中,请稍候
			</template>
			<template v-else-if="userInfo.user">
			  欢迎登录,{{userInfo.user.username}},<a style="cursor: pointer; color: blue;" @click="logout">退出</a>
			</template>
			<template v-else>
			  <a style="cursor: pointer; color: blue;" @click="login">点击登录</a>
			</template>
		</div>
		`,
		'props':[
			'userInfo'
		],
		'methods':{
			logout:function(){
				this.userInfo.logout();
			},
			login:function(){
				this.userInfo.login();
			}
		}
	}
});