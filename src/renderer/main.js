import Vue from 'vue';
import axios from 'axios';
import { notification, message, modal } from 'ant-design-vue';

import App from './App';
import router from './router';
import store from './store';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.prototype.$notification = notification;
Vue.prototype.$message = message;
Vue.prototype.$modal = modal;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app');
