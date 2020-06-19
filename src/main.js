import App from './App'
import Vue from 'vue'
import store from './vuex'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.config.productionTip = false
Vue.use(ElementUI,{size:'mini'})

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
