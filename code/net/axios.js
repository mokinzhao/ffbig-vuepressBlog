/*
 * @Author: mokinzhao
 * @Date: 2021-04-18 21:29:48
 * @Description:Axios 二次封装
 */

//全局配置
axios.defaults.baseURL = "127.1.1"; //请求地址前缀
axios.defaults.withCredentials = true; //跨域是否携带token
axios.defaults.timeout = 2000 * 10; //请求超时

//请求拦截器
axios.interceptors.request.use((config) => {});

//响应拦截器
axios.interceptors.response.use(
  function onFulfilled(respones) {},
  function onRejected(reason) {}
);
