import Vue from 'vue/dist/vue.esm.js'
import App from './App.vue'
import axios from 'axios'

Vue.config.productionTip = false;
Vue.prototype.axios = axios;


Vue.prototype.app = new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
});
