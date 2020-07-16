<template>
  <div id="app">
    <div class="form">
      <div class="form-group">
        <label>用户名</label>
        <input type="text" class="form-control" v-model="inputUserName" />
      </div>
      <div class="form-group">
        <label>密码</label>
        <input type="password" class="form-control" v-model="inputPassword" />
      </div>
      <div>
        <input type="hidden" v-model="captchaTicket" />
        <input type="hidden" v-model="captchaUserId" />
      </div>
      <button :class="verifyBtnClass" @click="captcha.showCaptcha=true">{{verifyBtnTxt}}</button>
      <button class="btn btn-info btn-block" style="margin-top:14px;" @click="login">登陆</button>
    </div>
    <vue-sim-captcha
      v-model="captcha.showCaptcha"
      :appId="captcha.appId"
      :callback="saveTicket"
      :source="captcha.source"
    ></vue-sim-captcha>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      captcha: {
        appId: "132132",
        source: {
          reqVCodeImgUrl: "https://captcha.moeci.com/api/vCode/VCodeImg",
          reqVCodeCheckUrl: "https://captcha.moeci.com/api/vCode/VCodeCheck"
        },
        showCaptcha: false
      },
      inputUserName: "",
      inputPassword: "",
      captchaTicket: "",
      captchaUserId: "",
      verifyBtnTxt: "点击验证",
      verifyBtnClass: "btn btn-gray btn-block"
    };
  },
  methods: {
    saveTicket(res) {
      if (res.code === 0) {
        // 验证码服务端-验证通过
        console.log("第一次验证通过");
        // 第一次验证通过
        this.verifyBtnTxt = "验证通过";
        this.verifyBtnClass = "btn btn-success btn-block";
        // 准备 业务后台 第二次验证
        this.captchaTicket = res.ticket;
        this.captchaUserId = res.userId;
        console.log("第一次验证 结束");
      }
    },

    login() {
      let userName = this.inputUserName;
      let password = this.password;
      let ticket = this.captchaTicket;
      let userId = this.captchaUserId;
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/home/login", true);
      // 添加http头，发送信息至服务器时内容编码类型
      // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
          let data = JSON.parse(xhr.responseText);
          if (data.code == -10) {
            // 账号或密码错误
            alert("账号或密码错误");
          } else if (data.code == -11) {
            alert("请点击验证");
          } else if (data.code == -12) {
            alert("请输入账号,密码");
          } else if (data.code < 0) {
            // 验证不通过
            console.log(data);
            this.verifyBtnTxt = "验证失败, 请重新点击验证";
            this.verifyBtnClass = "btn btn-gray btn-block";
            this.captchaTicket = "";
            this.captchaUserId = "";
          } else {
            // 一切正确
            alert("登陆成功");
          }
        }
      };
      xhr.send(JSON.stringify(data));
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
