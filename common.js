var api = {
	"formal": {
		"interface": "https://api.bdmartech.com", //接口
		"domain": "http://m.bdmartech.com",
		"cosConfig": { //`https://plbs-test-1257286922.cos.ap-shanghai.myqcloud.com/...`
			"Bucket": 'plbs-test-1257286922',
			"Region": 'ap-shanghai',
			"SecretId": '',
			"SecretKey": ''
		},
		"wx": {
			"AppID": "wx11eb371cd85adfd4",
			"ast": ""
		}
	},
	"dev": {
		"interface": "http://api-head.wsshanghai.com", //接口
		"domain": "http://portrait.bdmartech.com/",
		"cosConfig": { //`https://jobpassport-1259247972.cos.ap-shanghai.myqcloud.com/...`
			"Bucket": 'plbs-test-1257286922',
			"Region": 'ap-shanghai',
			"SecretId": '',
			"SecretKey": ''
		},
		"wx": {
			"AppID": "wxb33e824504e4a764",
			"ast": ""
		}
	}
}
var lks = "dev";
export default {
	Interface: {
		"site": lks,
		"apiurl": api[lks]["interface"],
		"domain": api[lks]["domain"],
		"cosConfig": api[lks]["cosConfig"],
		"wxInfo": api[lks]["wx"],
		"addr": {
			"getCos": "/v6/ApiBase-getCos.htm", //获取腾讯云cos临时密钥
			"getWeChatInfo": "/v6/ApiWeChat-getWeChatInfo.htm", //用户授权后获取用户信息 ?code=xxx
			"getWeChatOpenId": "/v6/ApiWeChat-getWeChatOpenId.htm", //静默授权后获取用户信息 ?code=xxx
			"getMaterialList": "/v6/ApiMaterial-getMaterialList.htm", //获取头像所需素材接口?eCode=aleinqi&st=logo(logo:logo,img:图标，box：相框)
			"slideShow": "/v6/ApiBase-slideShow.htm", //广告位列表 ?eCode=aleinqi
			"slideShow2": "/v6/ApiBase-slideShow.htm", //记录广告位点击 [POST] ?id=1
			"headImage": "/v6/ApiCustomer-headImage.htm", //上传头像接口 [POST] ?eCode=aleinqi&openid=123
			"qrcodeStatus": "/v6/ApiBase-qrcodeStatus.htm" //QR是否显示 ?eCode=aleinqi
		}
	}
}
