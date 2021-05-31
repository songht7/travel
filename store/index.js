import Vue from 'vue'
import Vuex from 'vuex'
import common from "../common.js"
var jweixin = require('jweixin-module')
Vue.use(Vuex)


/*
 *	dispatch.actions
 * 	commit.mutations
 * */
const store = new Vuex.Store({
	state: {
		loading: "0",
		data: {},
		interface: common.Interface,
		systemInfo: {},
		imgTemp: "",
		wxInfo: common.Interface.wxInfo,
		wxCode: "",
		isWeixin: false,
		portrait: "",
		cosConfig: common.Interface.cosConfig,
		userInfo: {}
	},
	mutations: {
		update_data(state, data) {
			state.data = data
		},
		setSystemInfo(state, data) {
			state.systemInfo = data
		}
	},
	actions: {
		getData(ctx, parm) {
			let _parm = parm.parm || '';
			let _url = ctx.state.interface.apiurl + ctx.state.interface.addr[parm.inter] + _parm
			console.log("getData-url-", parm.inter, "：", _url)
			console.log("getData-parm-", parm.inter, "：", parm)
			var result = [];
			uni.request({
				url: _url,
				data: parm.data || {},
				method: parm.method || "GET",
				header: parm.header || {},
				success(res) {
					console.log("getData-success-", parm.inter, "：", res)
					//console.log(res)
					if (res.success) {
						ctx.commit("update_data", res.data.data)
					}
					result = res.data
				},
				fail(err) {
					console.log("getData-err-", parm.inter, "：", err)
					result = {
						"success": false,
						"msg": "接口请求失败",
						"err": err
					}
				},
				complete() {
					if (parm.fun) {
						new parm.fun(result)
					}
				}
			})
		},
		isWeixin(ctx) {
			let _isWeixin = !!/micromessenger/i.test(navigator.userAgent.toLowerCase());
			console.log("==isWeixin==", _isWeixin)
			ctx.state.isWeixin = _isWeixin;
		},
		isIOS(ctx) {
			var isIphone = navigator.userAgent.includes('iPhone');
			var isIpad = navigator.userAgent.includes('iPad');
			return isIphone || isIpad;
		},
		getWXCode(ctx) {
			console.log("---getWXCode---")
			if (!ctx.state.isWeixin) {
				console.log("fffffffffffff")
				return
			}
			console.log("tttttttttttt")
			var _uWXInfo = "";
			uni.getStorage({
				key: 'uWXInfo',
				success: function(res) {
					console.log("success")
					_uWXInfo = res.data;
				},
				complete: function() {
					console.log("=====getStorage-_uWXInfo======")
					console.log(_uWXInfo)
					if (_uWXInfo && _uWXInfo.openid) {
						console.log("=====1======")
						ctx.state.userInfo = _uWXInfo;
						var __openid = _uWXInfo.openid;
					} else {
						console.log("=====2======")
						var code = "";
						let reg = new RegExp('(^|&)code=([^&]*)(&|$)', 'i')
						let r = window && window.location.search.substr(1).match(reg)
						if (r != null) {
							code = unescape(r[2])
						}
						console.log("code：", code)
						if (code) {
							let _pram = {
								"inter": "getWeChatInfo",
								"parm": `?code=${code}`
							};
							_pram["fun"] = function(res) {
								console.log("getWeChatInfo：", res)
								let _data = res.data.data;
								uni.setStorage({
									key: 'uWXInfo',
									data: _data,
									success: function() {}
								})
							}
							ctx.dispatch("getData", _pram);
						} else {
							var appid = ctx.state.interface.wxInfo.AppID;
							let redirect_uri = ctx.state.interface.domain;
							let REDIRECT_URI = encodeURIComponent(redirect_uri), //授权后重定向的回调链接地址， 请使用 urlEncode 对链接进行处理
								scope = "snsapi_userinfo", //snsapi_base，snsapi_userinfo （弹出授权页面，获取更多信息）
								state = "STATE"; //重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节
							var _url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' +
								REDIRECT_URI +
								'&response_type=code&scope=' + scope + '&state=' + state + '#wechat_redirect';
							console.log("_url:", _url)
							window.location.href = _url;
						}
					}
				}
			});

		},
		wxShare(ctx, parm) {
			var that = this;
			var share_url = parm.share_url,
				title = parm.title,
				imgUrl = parm.imgUrl,
				dec = parm.dec;
			//console.log(share_url, title, dec)
			var funTicket = function(res) {
				// 			console.log("=======getTicket======")
				// 			console.log(res)
				uni.setStorage({
					key: 'wx_ticket',
					data: {
						"access_token": res.access_token,
						"jsapi_ticket": res.ticket,
						"noncestr": res.noncestr,
						"signature": res.signature,
						"expires_in": res.expires_in
					},
					success: function() {}
				});
				var _config = {
					debug: false,
					appId: Interface.wx.appid,
					timestamp: res.timestamp,
					nonceStr: res.noncestr,
					signature: res.signature,
					jsApiList: [
						'updateAppMessageShareData',
						'updateTimelineShareData',
						'onMenuShareAppMessage',
						'onMenuShareTimeline',
						'onMenuShareQQ'
					]
				}
				wx.config(_config);
			}
			var getTicketUrl = location.origin + "/#/";
			if (ctx.dispatch("isIOS")) {
				getTicketUrl = location.origin + "/";
			}
			var data = {
				"inter": "getJsApiTicket",
				"parm": `?url=${getTicketUrl}`,
				"fun": funTicket
			}
			let wx_ticket = ctx.dispatch("getData", _pram);

			let _href = location.origin + "/" + location.hash;
			// 		console.log("======share_url=====")
			// 		console.log(_href)
			imgUrl = imgUrl ? imgUrl : Interface.domain + "/static/share.png";
			var wxSet = {
				title: title || "看，我的专属头像",
				desc: dec || "定制我的趣味头像吧！",
				link: share_url,
				imgUrl: imgUrl,
				success: function() {
					let fun = function(storageRes) {
						let openid = storageRes.openid ? storageRes.openid : "";
						let test_openid = Interface.wx.test_openid;
						let _head = {
							"openid": openid || test_openid
						};
						console.log("-----share succ----")
						console.log(_head)
					}
					ctx.dispatch("getMyStorage", {
						key: "uWXInfo",
						val: "",
						fun: fun
					})
				}
			};
			wx.ready(function() {
				//wx.updateAppMessageShareData(wxSet);
				//wx.updateTimelineShareData(wxSet);
				// 2. 分享接口
				// 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
				wx.onMenuShareAppMessage(wxSet);
				// 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
				wx.onMenuShareTimeline(wxSet);
				// 2.3 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
				wx.onMenuShareQQ(wxSet);
			});
		},
		queryString(ctx, value) {
			const reg = new RegExp(`(^|&)${value}=([^&]*)(&|$)`, 'i')
			const r = window && window.location.search.substr(1).match(reg)
			var data = "";
			if (r != null) {
				data = unescape(r[2])
			}
			if (value == 'code') {
				ctx.state.wxCode = data;
			}
		},
		getMyStorage(ctx, pram) {
			var key = pram.key,
				val = pram.val,
				fun = pram.fun;
			var _storage = "";
			uni.getStorage({
				key: key,
				success: function(res) {
					if (val) {
						_storage = res.data.val;
					} else {
						_storage = res.data;
					}
				},
				complete(c) {
					if (fun) {
						new fun(_storage)
					}
				}
			});
		},
		getSystemInfo(ctx) {
			var systemInfo = {}
			uni.getSystemInfo({
				success(res) {
					systemInfo = res
					console.log(systemInfo);
				},
				complete() {
					ctx.commit("setSystemInfo", systemInfo)
				}
			});
		}
	},
	modules: {}
})
export default store
