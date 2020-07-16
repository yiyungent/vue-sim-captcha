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

export default captcha