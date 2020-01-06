import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from './components/Login.vue'
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ './components/Login.vue')
// import Home from './components/Home.vue'
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ './components/Home.vue')
// import Welcome from './components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ './components/Welcome.vue')
// import Users from './components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users" */ './components/user/Users.vue')
// import Roles from './components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "power" */ './components/power/Roles.vue')
// import Rights from './components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "power" */ './components/power/Rights.vue')
// import Category from './components/goods/Category.vue'
const Category = () => import(/* webpackChunkName: "goods" */ './components/goods/Category.vue')
// import Params from './components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "goods" */ './components/goods/Params.vue')
// import List from './components/goods/List.vue'
const List = () => import(/* webpackChunkName: "goods" */ './components/goods/List.vue')
// import Add from './components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "goods" */ './components/goods/Add.vue')
// import Order from './components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "order" */ './components/order/Order.vue')
// import Report from './components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "report" */ './components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/categories', component: Category },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }

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
