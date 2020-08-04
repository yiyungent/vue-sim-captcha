<template>
  <div id="simCaptcha-layer" :class="layerClass">
    <div id="simCaptcha-vCodeTip">{{resVCodeTip}}</div>
    <div id="simCaptcha-img-box">
      <img ref="simCaptchaImg" id="simCaptcha-img" :src="resVCodeImg" @click="imgClick" v-show="resVCodeImg!=''" />
      <div id="simCaptcha-loading">
        <div class="simCaptcha-loading-icon">&#xe600;</div>
        <div class="simCaptcha-loading-tip">加载中...</div>
      </div>
      <div id="simCaptcha-marks">
        <div
          v-for="(item, index) in markItems"
          :key="index"
          :id="'simCaptcha-mark-'+(index+1)"
          class="simCaptcha-mark"
          :style="{left:item.x+'px', top:item.y+'px'}"
          @click="markClick(index)"
        >{{index+1}}</div>
      </div>
      <span id="simCaptcha-errorTip" :class="errorTipClass">{{errorTip}}</span>
    </div>
    <div class="simCaptcha-bottom">
      <button id="simCaptcha-btn-close" @click="valueData=false">&#xe60a;</button>
      <button id="simCaptcha-btn-refresh" @click="refreshVCode">&#xe675;</button>
      <button id="simCaptcha-btn-confirm" @click="sendVCodePos">确认</button>
    </div>
  </div>
</template>

<script>
import tools from "./common/tools";

export default {
  name: "VueSimCaptcha",
  props: {
    // 是否显示验证码弹出层
    value: {
      type: Boolean,
      required: true,
      default: false
    },
    appId: {
      type: String,
      required: true
    },
    source: {
      type: Object,
      required: true,
      validator: function(value) {
        return (
          value.baseUrl !== undefined
        );
      }
    },
    callback: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      // 用户点击验证码图片的位置数据 {Array} eg:  [{ x: 12, y: 35 }, { x: 52, y: 35 }, { x: 32, y: 75 }]
      vCodePos: [],
      // 从后端响应得到的appId
      resAppId: "",
      // 验证是否通过效验票据
      resTicket: "",
      // 用户会话唯一标识
      resUserId: "",
      // 验证码图片 base64
      resVCodeImg: "",
      // 验证码提示 eg: 请依序点击 走 炮 跳
      resVCodeTip: "",

      // 错误提示 eg: 1.点错啦，请重试 2.这题有点难，为你换一个试试吧
      errorTip: "",

      markItems: [], // [{x:12,y:13},{x:16,y:23}] (px)
      valueData: this.value,
      layerClass: this.valueData ? "simCaptcha-show" : "simCaptcha-hidden",
      errorTipClass: "",

      sourceData:{
        baseUrl: this.source.baseUrl,
        imgUrl: this.source.imgUrl || "/api/SimCaptcha/Img",
        checkUrl: this.source.checkUrl || "/api/SimCaptcha/Check"
      }
    };
  },
  computed: {},
  watch: {
    value: function(newVal) {
      this.valueData = newVal;
    },
    valueData: function(newVal) {
      this.$emit("input", newVal);
      if (newVal) {
        this.layerClass = "simCaptcha-show";
        // if(没有验证码数据) 先请求新验证码数据
        if (this.resVCodeImg == "") {
          // 请求新验证码数据
          this.refreshVCode();
        }
      } else {
        this.layerClass = "simCaptcha-hidden";
      }
    },
    errorTip: function() {
      this.updateErrorTipClass();
    }
  },
  created(){

      // imgUrl 拼接成绝对url
    if (this.sourceData.imgUrl.indexOf("http") != 0) {
      // 相对路径
      if (this.sourceData.imgUrl.indexOf("/") != 0) {
        this.sourceData.imgUrl = this.sourceData.baseUrl + "/" + this.sourceData.imgUrl;
      } else {
        this.sourceData.imgUrl = this.sourceData.baseUrl + this.sourceData.imgUrl;
      }
    }
    // checkUrl 拼接成绝对url
    if (this.sourceData.checkUrl.indexOf("http") != 0) {
      // 相对路径
      if (this.sourceData.checkUrl.indexOf("/") != 0) {
        this.sourceData.checkUrl = this.sourceData.baseUrl + "/" + this.sourceData.checkUrl;
      } else {
        this.sourceData.checkUrl = this.sourceData.baseUrl + this.sourceData.checkUrl;
      }
    }

  },
  methods: {
    /***
     * 刷新验证码弹出层：1.刷新验证码图片，2.更新验证码提示 3. 清空点触位置数据 4.清空图片上的全部点触标记
     */
    refreshVCode() {
      // 清空点触位置数据
      this.vCodePos = [];
      // 清除图片上的全部点触标记
      this.clearPointMark();
      // ajax请求新的验证码图片base64
      tools.httpGet(this.sourceData.imgUrl, response => {
        if (response.code == 0) {
          // 成功获取新验证码
          // 保存并更新 验证码图片
          this.resVCodeImg = response.data.vCodeImg;
          // 更新验证码提示
          this.resVCodeTip = response.data.vCodeTip;
          // 保存/更新 用户此次会话唯一标识
          this.resUserId = response.data.userId;
        } else {
          // 获取验证码失败
          this.errorTip = response.message;
        }
      });
    },

    /**
     * 清空图片上的全部点触标记
     */
    clearPointMark() {
      // #simCaptcha-marks 内元素全部移除
      this.markItems = [];
    },

    /**
     * 标记被点击: eg:当前标记序号(1)(2)(3)(4)(5), 点击(3), 移除(3)(4)(5)
     */
    markClick(index) {
      var length = this.markItems.length;
      for (var i = index; i < length; i++) {
        // 将(index) 及之后的标记html移除
        var removeMark = this.markItems.pop();
        // 将vCodePos中 index 及之后的位置数据移除
        var removePos = this.vCodePos.pop();
      }
    },

    /**
     * 获取点击位置(相对于图片的相对位置)(px)
     * @param event 验证码图被点击的事件
     * @return {Object} { x: 123, y:123 } (px)
     */
    getImgClickPos(event) {
      // (2)不考虑Firefox
      var xOffset = event.offsetX;
      var yOffset = event.offsetY;

      return { x: xOffset, y: yOffset };
    },

    /**
     * 验证码图片被点击时
     */
    imgClick(event) {
      var pxPos = this.getImgClickPos(event);
      // 在点击处创建点标记
      this.createPointMark(pxPos);

      // 记录点击位置数据(转换为 相对于图片的百分比 位置), 放入 _vCodePos
      var percentPos = this.pxToPercentPos(pxPos);
      this.vCodePos.push(percentPos);
    },

    /**
     * 创建点标记
     * @param pos {Object} 相对于图片的位置( { x: 12, y: 56 } ) (单位px)
     */
    createPointMark(pos) {
      pos.x = parseInt(pos.x);
      pos.y = parseInt(pos.y);

      this.markItems.push({ x: pos.x - 10, y: pos.y - 10 });
    },

    /**
     * 像素相对位置 -> 百分比相对位置
     * @param {Object} pxPos 相对于验证码图片的相对位置(px)
     * @return {Object} { x: 20, y:40 } (表示x轴20%, y轴40%)
     */
    pxToPercentPos(pxPos) {
      // 即时获取当前验证码图片宽高(像素)
      var imgSize = this.getImgSize();
      var imgWidthPx = imgSize.width;
      var imgHeightPx = imgSize.height;

      var xPercent = parseInt((pxPos.x / imgWidthPx) * 100);
      var yPercent = parseInt((pxPos.y / imgHeightPx) * 100);

      return { x: xPercent, y: yPercent };
    },

    /**
     * 即时获取当前验证码图片宽高(像素)
     * @return {Object} eg:{width: 200, height:200} (px)
     */
    getImgSize() {
      var width = this.$refs.simCaptchaImg.offsetWidth;
      var height = this.$refs.simCaptchaImg.offsetHeight;

      return { width, height };
    },

    /***
     * 摧毁当前验证码（隐藏验证码弹出层，清除验证码图片base64），下次show 将请求新验证码图片base64
     */
    destroy() {
      // 隐藏当前验证码弹出层
      this.valueData = false;
      // 清除全部点触标记
      this.clearPointMark();
      // 清空点触位置数据
      this.vCodePos = [];
      // 清除验证码相关数据
      this.resVCodeImg = "";
      this.resVCodeTip = "";

      // 注意: 不清除 resAppId, resTicket, 因为通过验证后可能会通过 $refs.captcha.resAppId,resTicket 获取票据, 
      // 直到下一次通过验证获得票据, resAppId, resTicket 才得到更新
      // this.resAppId = "";
      // this.resTicket = "";

      this.errorTip = "";
    },

    /**
     * 在验证码弹出层展示 成功通过验证
     * @param {Number} ts 本次点击验证码花费时间（js 13位时间戳）// 保留，暂时不用，随便传一个，或不传
     */
    showSuccessTip(ts) {
      // 在验证码弹出层展示 验证通过
      // 更新错误提示为 "验证通过"
      this.errorTip = "验证通过";
      // 0.5s后 destroy 验证码层
      setTimeout(this.destroy, 500);
    },

    /***
     * 将用户点击验证码的位置数据发送到验证码服务端   (每个位置(x轴, y轴))
     */
    sendVCodePos() {
      var ts = Date.now(); // js 13位 毫秒时间戳
      var verifyInfo = {
        appId: this.appId,
        vCodePos: this.vCodePos,
        userId: this.resUserId,
        ua: navigator.userAgent,
        ts: ts
      }; // ua, ts 服务端暂时未用，保留。用户花费在此验证码的时间 = 验证码服务端 接收到点击位置数据时间 - 验证码服务端 产生验证码图片时间
      // 发送ajax到验证码服务端 -> 得到response结果，封装为 res
      tools.httpPost(this.sourceData.checkUrl, verifyInfo, response => {
        // code: 0: 通过验证
        if (response.code == 0) {
          // 通过验证 -> 1.回调callback（成功回调） 2.销毁验证码弹出层destroy
          var res = {
            code: 0,
            userId: this.resUserId,
            ticket: response.data.ticket,
            appId: response.data.appId,
            bizState: null
          }; // bizState自定义透传参数，暂未实现，保留
          // 将 从验证码服务端得到的 appId, ticket存起来
          this.resAppId = res.appId; // TODO: 暂时无用，可以将这个验证码服务端返回的resAppId与 当前客户端浏览器存的appIdData做比较
          this.resTicket = res.ticket;
          this.callback(res);
          // 在摧毁验证码层之前，先在验证码层展示成功通过验证提示
          this.showSuccessTip();
        } else {
          // 未通过验证 -> 1.提示用户 2.if(错误次数未达上限)：清空用户点击验证码的位置数据，重置，让用户重新点击 3.else(错误次数达到上限)：刷新验证码弹出层（请求新验证码图片，更新验证码提示）
          // code: -1: 验证码错误 且 错误次数未达上限
          if (response.code == -1) {
            this.errorTip = "点错啦, 请重试";
            // 清空点触位置数据
            this.vCodePos = [];
            // 清除图片上的全部点触标记
            this.clearPointMark();
          } else if (response.code == -2) {
            // code: -2: 验证码错误 且 错误次数已达上限
            this.errorTip = "这题有点难, 为你换一个试试吧";
            this.refreshVCode();
          } else if (response.code == -3) {
            // 验证码无效（被篡改）
            this.errorTip = "验证码无效, 为你换一个试试吧";
            this.refreshVCode();
          } else if (response.code == -4) {
            // 验证码过期
            this.errorTip = "验证码过期, 为你换一个试试吧";
            this.refreshVCode();
          } else if (response.code == -5) {
            // 验证码无效
            this.errorTip = "验证码过期, 为你换一个试试吧";
            this.refreshVCode();
          }
        }
      });
    },

    updateErrorTipClass() {
      if (this.errorTip == "验证通过" || this.errorTip == "") {
        this.errorTipClass =
          "simCaptcha-errorTip-success simCaptcha-errorTip-up";
      } else {
        this.errorTipClass = "simCaptcha-errorTip-fail simCaptcha-errorTip-up";
        // 验证码层震动
        this.layerClass = "simCaptcha-shake";
      }
      // 1.8秒后向下动画隐藏
      setTimeout(() => {
        // 注意: 为了使 错误提示上下css动画, 背景颜色 down时不掉色，所以需要这样做
        if (this.errorTip == "验证通过" || this.errorTip == "") {
          this.errorTipClass = "simCaptcha-errorTip-success";
        } else {
          this.errorTipClass = "simCaptcha-errorTip-fail";
          // 验证码层停止震动
          this.layerClass = "simCaptcha-show";
        }
      }, 1800);
    }
  }
};
</script>

<style scoped>
@import "~@/assets/css/sim-captcha.css";
</style>