// 1.设置axios全局路径
axios.defaults.baseURL='http://localhost:8080';
// 2.全局配置axios,给Vue添加要给属性
Vue.prototype.$http = axios;

// 3.配置前置拦截器
axios.interceptors.request.use(config => {
    // 获取token
    let token = localStorage.getItem("token");
    // console.debug(config);
    if (token) {
        // 如果有token,将token添加到请求头中
        config.headers['TOKEN'] = token;
    }
    return config;
}, error => {
    Promise.reject(error);
});

// 4.配置后置拦截器
axios.interceptors.response.use(config => {
    // console.debug(config.data);
    if (config.data.message === "noAuth" && !config.data.success) {
        localStorage.removeItem("token")
        localStorage.removeItem("loginInfo")
        location.href = "/login.html";
    }
    return config;
}, error => {
    Promise.reject(error);
});
