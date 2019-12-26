import Vue from 'vue'
import App from './App.vue'
const fb = require('./firebaseConfig.js');
import router from './router'
import {store} from './store.js'
import VueRouter from "vue-router";

Vue.use(VueRouter);

Vue.config.productionTip = false;
// handle page reloads
let app;
// eslint-disable-next-line no-unused-vars
fb.auth.onAuthStateChanged(user => {
  if (!app) {
    app = new Vue({
      el: '#app',
      router,
      store,
      components: { App },
      template: '<App/>',
      render: h => h(App)
    });
  }
});
