// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueCircleSlider from 'vue-circle-slider'
import VueKatex from 'vue-katex'
import 'katex/dist/katex.min.css'
import * as math from 'mathjs'

Vue.config.productionTip = false

Vue.use(VueKatex)
Vue.use(VueCircleSlider)
Vue.use(math)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
