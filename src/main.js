import Vue from 'vue'
import App from './App.vue'
import VueSimCaptcha from './lib/index.js'

Vue.use(VueSimCaptcha)

new Vue({
  el: '#app',
  render: h => h(App)
})
