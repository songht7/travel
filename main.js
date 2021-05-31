import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
// 引入vuex 状态库
import store from "./store";
Vue.prototype.$store = store;

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
