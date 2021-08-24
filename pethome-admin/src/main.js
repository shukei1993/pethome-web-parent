import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'
/*// 引用mock,模拟数据
import Mock from './mock'
Mock.bootstrap();*/
import 'font-awesome/css/font-awesome.min.css'
// 引入axios
import axios from 'axios'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)
// 全局配置axios,给Vue添加要给属性
Vue.prototype.$http = axios;
// 全局配置axios的基本路径
axios.defaults.baseURL="http://localhost:8080";

//NProgress.configure({ showSpinner: false });

const router = new VueRouter({
  routes
})

// 前置路由拦截器
router.beforeEach((to, from, next) => {
  //NProgress.start();
  if (to.path === '/login') {
    localStorage.removeItem('token');
  }
  let token = localStorage.getItem("token");
  if (!token && to.path !== '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
});

// 3.配置前置拦截器
axios.interceptors.request.use(config => {
    // 获取token
    let token = localStorage.getItem("token")
    // console.debug(config);
    if (token) {
        // 如果有token,将token添加到请求头中
        config.headers['TOKEN'] = token;
    }
    return config;
}, error => {
    Promise.reject(error);
})

// 4.配置后置拦截器
axios.interceptors.response.use(config => {
    // console.debug(config);
    return config;
    if (!config.data.success && config.data.message === "noAuth") {
        localStorage.removeItem("token")
        localStorage.removeItem("loginInfo")
        location.href = "/#/login";
    }
}, error => {
    Promise.reject(error);
})





//router.afterEach(transition => {
//NProgress.done();
//});

new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app')

