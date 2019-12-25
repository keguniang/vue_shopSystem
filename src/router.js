import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }

]

const router = new VueRouter({
  routes
})

// 为路由对象添加 beforeEach 导航守卫
router.beforeEach((to, from, next) => {
  //  to 将要访问的路径  from 代表从哪个路径跳转而来 next是一个函数，next()放行  next('/login') 强制跳转
  // 如果用户访问的登录页，直接放行
  if (to.path === '/login') return next()
  // 从sessionStorage 中获取token
  const token = window.sessionStorage.getItem('token')
  // 如果没有token,强制跳转到登录页
  if (!token) return next('/login')
  // 有token ,放行
  next()
})

export default router
