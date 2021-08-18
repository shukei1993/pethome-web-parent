// 设置axios全局路径
axios.defaults.baseURL='http://localhost:8080'
// 全局配置axios,给Vue添加要给属性
Vue.prototype.$http = axios;