/* eslint-disable import/no-duplicates */
import Vue from 'vue'
// Message弹窗提示组件
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 把Message全局挂载到Vue.prototype，这样所有的实例中都可以通过this.$message访问到Message
Vue.prototype.$message = Message
