import Vue from 'vue'
import Router from 'vue-router'
import QuantumVue from '@/components/QuantumVue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'QuantumVue',
      component: QuantumVue
    }
  ]
})
