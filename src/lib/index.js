/*
 * @Author: yiyun
 * @Description: 
 */
import simCaptcha from './VueSimCaptcha.vue'

const captcha = {
  install: function (Vue) {
    Vue.component(simCaptcha.name, simCaptcha)
  }
}
// global 情况下 自动安装
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(captcha)
}

const VERSION = "0.1.1";
const GIT_HASH = "";
console.log(
  `${"\n"} %c vue-sim-captcha v${VERSION} ${GIT_HASH} %c https://github.com/yiyungent/vue-sim-captcha ${"\n"}${"\n"}`,
  "color: #fff; background: #030307; padding:5px 0;",
  "background: #ff80ab; padding:5px 0;"
);

export default captcha