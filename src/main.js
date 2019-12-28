// 打包入口文件
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// // 导入全局字体图标
import './assets/fonts/iconfont.css'
import axios from 'axios'
// 导入表格树形结构插件
import treeTable from 'vue-table-with-tree-grid'

// 将treeTable注册为全局可用的组件，使用标签为<tree-table>
Vue.component('tree-table', treeTable)
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios响应拦截器
axios.interceptors.response.use(function (res) {
  // 可以直接获取到真实的数据，这样真实发送请求的时候就不用在.data的方式获取数据了
  res = res.data
  return res
}, function (err) {
  console.log(err)
})

// axios请求拦截器  为请求头添加Authorization字段，值为token
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 可以通过this.axios访问到axios
Vue.prototype.axios = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
