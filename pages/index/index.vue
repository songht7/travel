<template>
	<view :class="['content',theme]">
		<view class="uni-padding-wrap uni-common-mt">
			<view class="portrait-box" v-show="!selectImg">
				<imageWrapper ref="imageWrapper" :imgBg="imgBg" :waterState="waterState" :watermark="watermark" :wmSize="wmSize"
				 :maskImg="maskImg" :frame="frame">
					<view class="text" v-if="slots">
						头像
					</view>
				</imageWrapper>
			</view>
			<view class="portrait-main">
				<view class="ctgs">
					<block v-for="(obj,k) in swithCthType" v-if="imgList[obj.key].length" :key="k">
						<view :class="['selBtn',ctgis==obj.key?'selBtnOn':'']" @click="swithCth(obj.key)">{{obj.key=='logo'?company:''}}{{obj.name}}</view>
					</block>
				</view>
				<view class="ctgBox">
					<view class="ctgCont">
						<view v-if="ctgis=='logo'&&apiWaterState" :class="['ctgImgBlock','watermark',waterState?'waterOn':'waterOff']"
						 @click="setDec('watermark')">
							<img :src="watermark" class="ctgImg" alt="">
						</view>
						<block v-for="(obj,k) in imgList[ctgis]" :key="k">
							<view class="ctgImgBlock" @click="setDec(obj.st,`${obj.original_src}`)">
								<img :src="`${obj.original_src}`" class="ctgImg" alt="">
							</view>
						</block>
					</view>
				</view>
				<sunui-upimg-tencent v-show="false" :upImgConfig="upImgCos" @onUpImg="upCosData" @onImgDel="delImgInfo" ref="uImage"></sunui-upimg-tencent>
				<!-- <button type="primary" @tap="getUpImgInfoCos">获取上传Cos图片信息</button>
				<button type="primary" @tap="uImageTap">手动上传图片</button> -->
				<view class="imgSelect">
					<view class="webQRCode" v-if="apiWaterState">
						<canvas class="tki-qrcode-canvas" canvas-id="tki-qrcode-canvas" :style="{width:QRSize+'px',height:QRSize+'px'}" />
					</view>
					<!-- <img v-if="watermark" :src="watermark" alt=""> -->
					<block v-if="qrtst">
						<view class="" style="width: 100%;padding-bottom: 50upx;background: #FFFFFF;position: relative;z-index: 102;">
							<view class="">
								透明度(0.1-1)
								<input type="text" style="background: #DDDDDD;" v-model="QROpacity">
							</view>
							<view class="">
								大小(0.1-10)
								<input type="text" style="background: #DDDDDD;" v-model="wmSize">
							</view>
							<view class="">
								颜色(0-150)
								<input type="text" style="background: #DDDDDD;" v-model="QRColor">
							</view>
							<view @click="setWebQRcode">生成二维码(button)</view>
						</view>
					</block>
					<image-cropper :src="tempFilePath" :cropFixed="cropFixed" :cropWidth="cropWidth" :cropHeight="cropHeight" @confirm="confirm"
					 @cancel="cancel"></image-cropper>
					<view class="selPor" @tap="upload()">更改头像</view>
					<view class="selPor" @tap="upload('dec')">自定义挂件</view>
					<view class="editBtns">
						<view class="editBtn reSet" @click="resetImg">重置</view>
						<view class="editBtn" @click="toImage">完成</view>
					</view>
				</view>
			</view>
			<!-- <img src="" alt="" class="imgSmall"> -->
			<uni-popup :show="poptype === 'showNewImg'" position="full" mode="fixed" width='100' @hidePopup="togglePopup('')">
				<view id="Generated">
					<img class="imgs" v-if="newImg" :src="newImg" alt="">
					<view>长按保存图片</view>
					<view class="gen-btns">
						<view class="close-btn" @click="togglePopup('')">返回</view>
					</view>
				</view>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	var html2canvas = require("@/common/html2canvas.min.js");
	import QRCode from "@/common/qrcode.js";
	var cQRcode;
	import sunuiUpimgTencent from '@/components/sunui-upimg/sunui-upimg-tencent.vue';
	import imageWrapper from '@/components/image-wrapper.vue';
	import uniPopup from '@/components/uni-popup.vue';
	import ImageCropper from "@/components/invinbg-image-cropper/invinbg-image-cropper.vue";
	export default {
		data() {
			return {
				company: "", //公司
				theme: "", //主题色
				watermark: "", //站点水印二维码、logo
				waterState: false, //是否有水印
				apiWaterState: false, //后台是否允许开始水印
				QROpacity: 1, //水印透明度
				QRSize: 70, //水印大小
				wmSize: "0.5", //水印缩放大小
				QRColor: 0, //水印前景色
				qrtst: false, //水印测试
				eCode: "aleinqi", //后台对应企业code
				base64Img: "",
				tempFilePath: "",
				cropFixed: true, //true false,
				cropWidth: 250,
				cropHeight: 250,
				imgBg: "/static/default.jpg",
				maskImg: [],
				newImg: "",
				frame: "",
				"slots": false,
				loading: false,
				poptype: "",
				ctgis: "img",
				selectImg: false,
				decType: '',
				picture_list: [],
				cosFlag: true,
				cosArr: [],
				swithCthType: [{
						"name": "定制挂件",
						"key": "img",
						"myKey": "special"
					},
					// {
					// 	"name": "挂件",
					// 	"key": "dec",
					// 	"myKey": "dec"
					// }, 
					{
						"name": "相框",
						"key": "box",
						"myKey": "frame"
					}, {
						"name": "LOGO",
						"key": "logo",
						"myKey": "logo"
					}
				],
				imgType: ['img', 'box', 'logo'],
				imgList: {
					'img': [],
					'box': [],
					'logo': []
				},
				upImgCos: {
					cosConfig: this.$store.state.cosConfig,
					// 是否开启notli(开启的话就是选择完直接上传，关闭的话当count满足数量时才上传)
					notli: false,
					// 图片数量
					count: 1,
					// 上传图片背景修改 
					upBgColor: '#E8A400',
					// 上传icon图标颜色修改(仅限于iconfont)
					upIconColor: '#eee',
					// 上传svg图标名称
					upSvgIconName: 'icon-certificate',
					//是否压缩上传照片(仅小程序生效)
					sizeType: true,
					//相机来源(相机->camera,相册->album,两者都有->all,默认all)
					sourceType: "all",
					path: 'data/portrait/',
					photoType: "portrait-diy-"
				}
			}
		},
		onLoad(option) {
			var that = this;
			var ws = option.ws ? true : false;
			var _qrtst = option.qrtst ? option.qrtst : false;
			var eCode = option.eCode ? option.eCode : that.eCode;
			var _theme = option.tm ? option.tm : "";
			var _company = option.company ? option.company : "";
			//that.waterState = ws;//url判断是否显示QR 现接接口
			that.qrtst = _qrtst; //qr测试
			that.eCode = eCode;
			that.company = _company;
			that.theme = "theme-" + _theme;
			that.imgBg = eCode == 'xinda' ? "/static/default-xd.jpg" : "/static/default.jpg";
			that.getImgList();
			that.checkQR();
		},
		onShow() {
			this.getBase64Image();
		},
		onReady() {
			var that = this;
		},
		components: {
			sunuiUpimgTencent,
			imageWrapper,
			ImageCropper,
			uniPopup
		},
		methods: {
			getImgList() { //获取图片列表
				var that = this;
				var _imgType = that.imgType;
				_imgType.forEach((obj, k) => {
					var imgKey = obj;
					var _data = {
						inter: "getMaterialList",
						parm: `?eCode=${that.eCode}&st=${imgKey}`,
						fun: function(res) {
							if (res.success) {
								let result = res.data;
								if (result.list) {
									let _list = result.list;
									var cList = [];
									if (that.imgList[imgKey]) {
										cList = that.imgList[imgKey];
									}
									that.imgList[imgKey] = [...cList, ..._list];
								}
								// console.log('------imgList-------');
								console.log(that.imgList);
							}
						}
					};
					that.$store.dispatch("getData", _data)
				})
			},
			checkQR() { //检测是否显示QR
				var that = this;
				var _data = {
					inter: "qrcodeStatus",
					parm: `?eCode=${that.eCode}`,
					fun: function(res) {
						that.apiWaterState = false;
						that.waterState = false;
						if (res.success) {
							let result = res.data;
							//console.log(result.info)
							if (result.info == "1") {
								that.apiWaterState = true;
								that.waterState = true;
								that.setWebQRcode(); //生成站点二维码
							}
						}
					}
				};
				that.$store.dispatch("getData", _data)
			},
			upload(type) { //自定义上传图片
				var that = this;
				that.decType = type || '';
				uni.chooseImage({
					count: 1, //默认9
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album'], //从相册选择
					success: (res) => {
						if (type == 'dec') {
							var mk = {
								"url": res.tempFilePaths.shift(),
								"rotate": 0,
								"scale": 1,
								"delt": 0
							}
							that.maskImg.push(mk);
							return
						} else {
							that.tempFilePath = res.tempFilePaths.shift()
							that.selectImg = true;
						}
					}
				});
			},
			confirm(e) {
				var that = this;
				that.selectImg = false;
				that.tempFilePath = ''
				that.imgBg = e.detail.tempFilePath;
			},
			cancel() {
				this.selectImg = false;
				this.tempFilePath = '';
				console.log('canceled')
			},
			swithCth(ctgis) {
				this.ctgis = ctgis;
			},
			setWebQRcode() { //生成QR
				var that = this;
				var webUrl = that.$store.state.interface.domain + '#/?eCode=' + that.eCode + '&company=' + that.company + '&tm=' +
					that.theme;
				if (cQRcode) {
					cQRcode.clear()
				}
				cQRcode = new QRCode({
					context: that, // 上下文环境
					canvasId: "tki-qrcode-canvas", // canvas-id
					text: webUrl, // 生成内容
					correctLevel: 0, // 容错级别0、1、2、3，数字越大说明所需纠错级别越大
					background: `rgba(255, 255, 255, ${that.QROpacity})`, //背景色
					foreground: `rgba(${that.QRColor}, ${that.QRColor}, ${that.QRColor}, ${that.QROpacity})`, //前景色
					size: that.QRSize, // 二维码大小
					cbResult: function(res) { // 生成二维码的回调
						that.watermark = res;
					},
				});
			},
			setDec(type, url) {
				var that = this;
				if (type == 'watermark') {
					that.waterState = !that.waterState;
				} else {
					that.getBase64Image(type, url); //网络图片需先转base64
					//that.setImgToCanvas(type, url); //点击图片放入容器
				}
			},
			resetImg() {
				var that = this;
				that.maskImg = [];
				that.frame = "";
			},
			async toImage() {
				var that = this;
				await that.resetEditType();
				if (that.loading) {
					return false
				};
				var obj = document.getElementById("ImageWrapper");
				var width = obj.offsetWidth;
				var height = obj.offsetHeight;
				that.loading = true;
				uni.showLoading({
					title: "正在生成..."
				})
				html2canvas(obj, {
					backgroundColor: "transparent",
					useCORS: true, //网络图片
					allowTaint: true,
					tainttest: true,
					width: width,
					height: height
				}).then((canvas) => {
					that.loading = false;
					uni.hideLoading()
					let dataURL = canvas.toDataURL("image/png");
					that.poptype = "showNewImg";
					that.$store.state.portrait = [{
						"path": dataURL,
						"imgType": 'base64Img',
						"upload_percent": 0
					}];
					console.log("portrait:", that.$store.state.portrait)
					////that.uImageTap();///上传到COS
					that.newImg = dataURL;
				});
			},
			resetEditType() {
				this.$refs.imageWrapper.editType = "";
			},
			getBase64Image(type, dataURL) {
				var that = this;
				uni.showToast({
					title: '',
					icon: 'loading',
					duration: 1500
				});
				var img = new Image();
				img.crossOrigin = 'Anonymous'; // 重点！设置image对象可跨域请求
				img.setAttribute('crossorigin', ' *');
				img.src = dataURL + "?t=" + new Date().getTime();
				img.onload = function() {
					var canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					var ctx = canvas.getContext("2d");
					// ctx.setFillStyle('transparent');
					// ctx.fillRect(0, 0, img.width, img.height);
					// ctx.save()
					ctx.drawImage(img, 0, 0, img.width, img.height);
					var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
					var dataURL = canvas.toDataURL("image/" + ext);
					that.base64Img = dataURL;
					uni.hideToast();
					that.setImgToCanvas(type, dataURL) //转译为base64后放入容器
					return dataURL;
				}

			},
			setImgToCanvas(type, _url) {
				var that = this;
				setTimeout(() => {
					if (type == 'logo' || type == 'img') {
						var mk = {
							"url": _url,
							"rotate": 0,
							"scale": 1,
							"delt": 0
						}
						that.maskImg.push(mk);
					} else if (type == 'box') {
						that.frame = _url;
					}
				}, 500)
			},
			togglePopup(type) {
				var that = this;
				that.poptype = type;
				if (type == '') {
					that.$refs.uImage.upload_picture_list = [];
					//console.log(that.$refs.uImage.upload_picture_list)
				}
			}, // 手动上传图片(适用于表单等上传)
			uImageTap() {
				this.$refs.uImage.uploadimage(this.upImgCos);
			},
			// 删除图片 -(本地图片进行删除)
			async delImgInfo(e) {
				console.log('你删除的图片地址为:', e);
			},
			// 腾讯云
			async upCosData(e) {
				if (this.cosFlag) {
					this.cosArr = await e;
					// 可以根据长度来判断图片是否上传成功.
					if (this.cosArr.length == this.upImgCos.cosConfig.count) {
						uni.showToast({
							title: `上传成功`,
							icon: 'none'
						});
					}
				}
				this.cosFlag = false;

			},
			// 获取上传图片腾讯云
			async getUpImgInfoCos() {
				let arrImg = [];
				for (let i = 0, len = this.cosArr.length; i < len; i++) {
					try {
						if (this.cosArr[i].path_server != "") {
							await arrImg.push(this.cosArr[i].path_server.split(','));
						}
					} catch (err) {
						console.log('上传失败...');
					}
				}
				console.log('腾讯云转成一维数组:', arrImg.join().split(','));
			}
		}
	}
</script>

<style scoped>
	page {
		height: 100%;
	}

	.webQRCode {
		position: absolute;
		width: 100upx;
		height: 100upx;
		opacity: 0;
		left: -10000px;
	}

	.content {
		height: 100%;
		background: #b0ecd2;
	}

	.uni-padding-wrap {
		height: 100%;
	}

	.portrait-box {
		padding: 60upx 0 40upx;
		display: flex;
		justify-content: center;
		flex-direction: row;
		align-content: center;
		align-items: center;
		background-image: linear-gradient(#FFFFFF, #FFFFFF);
	}

	.portrait-main {
		min-height: calc(100% - 690upx);
		background-image: linear-gradient(#151c26, #242b3b);
	}

	.imgs {
		width: 100%;
	}

	#Generated {
		display: flex;
		justify-content: flex-start;
		flex-direction: column;
		align-content: center;
		align-items: center;
		position: relative;
		height: 90%;
		padding: 5% 0;
	}

	#Generated .imgs {
		width: 90%;
	}

	.gen-btns {
		position: absolute;
		width: 90%;
		left: 0;
		bottom: 0;
		padding: 40upx 5%;
		display: flex;
		flex-direction: row;
		align-content: center;
		align-items: center;
		justify-content: space-around;
	}

	.close-btn {
		background: #DDDDDD;
		color: #999999;
		border-radius: 10upx;
		font-size: 32upx;
		padding: 10upx 50upx;
	}

	.imgSmall {
		width: 100upx;
		height: 100upx;
	}

	.ctgs {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-content: center;
		text-align: center;
		align-items: center;
		background: #FAFAFA;
		overflow: hidden;
	}

	.imgSelect {
		position: fixed;
		width: 90%;
		padding: 10upx 5%;
		left: 0;
		bottom: 0;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		flex-wrap: wrap;
		align-content: center;
		align-items: center;
	}

	.editBtns {
		width: 50%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-content: center;
		align-items: center;
	}

	.selBtn {
		font-size: 28upx;
		padding: 20upx;
		flex: 1;
		position: relative;
	}

	.selBtn::after {
		content: "";
		height: 50%;
		width: 1px;
		background: #e7e7e7;
		overflow: hidden;
		position: absolute;
		right: -1px;
	}

	.selBtnOn {
		background: #151c26;
		color: #f17f5a;
	}

	.selBtn:last-child()::after {
		width: 0;
		background: none;
	}

	.ctgBox {
		padding: 10upx 10upx 100upx;
		height: 400upx;
		overflow-y: auto;
	}

	.ctgCont {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		flex-wrap: wrap;
		align-content: center;
		align-items: center;
		padding-bottom: 10upx;
	}

	.ctgImgBlock {
		width: 20%;
		height: 100upx;
		display: flex;
		justify-content: center;
		align-content: center;
		align-items: center;
		padding-bottom: 10upx;
		position: relative;
	}

	.watermark:before {
		content: "";
		/* ✔ */
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		background: url('../../static/icon-on-2.png') no-repeat 50% 50% rgba(0, 0, 0, .3);
		background-size: 50% auto;
		display: flex;
		align-content: center;
		justify-content: center;
		align-items: center;
		color: #FFFFFF;
		font-size: 60upx;
	}

	.waterOn:before {
		content: "";
		/* ✘ */
		background-image: url('../../static/icon-off-2.png');
	}

	.waterOff:before {
		content: "";
		/* ✔ */
		background-image: url('../../static/icon-on-2.png');
	}

	.ctgImg {
		max-width: 70%;
		max-height: 100%;
	}

	.editBtn,
	.selPor {
		font-size: 28upx;
		display: flex;
		justify-content: center;
		flex-direction: row;
		align-content: center;
		align-items: center;
		color: #f17f5a;
		line-height: 1;
		border-radius: 10upx;
		padding: 15upx 0;
	}

	.editBtn {
		width: 48%;
		color: #FFFFFF;
		border-radius: 20upx;
		background-image: linear-gradient(to right, #E5A590, #f17f5a);
		background: #f17f5a;
	}

	.reSet {
		background: #E5A590;
	}

	.theme-1 .selBtnOn {
		background: #d4ecff;
		color: #092f87;
	}

	.theme-1 .portrait-main {
		background-image: linear-gradient(#d4ecff, #d4ecff);
	}

	.theme-1 .ctgs {
		background: #FFFFFF;
	}

	.theme-1 .selBtn::after {
		content: "";
		width: 0;
		background: none;
	}
</style>
