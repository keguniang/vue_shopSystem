module.exports = {
  chainWebpack: config => {
    //   生产模式
    // 找到'app'的入口文件，再清空，再添加
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')
      //   通过externals 加载外部CDN资源
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        echarts: 'echarts',
        moment: 'moment',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      //   是否为发布模式  为html这个插件新增了一个自定义属性isProd
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })

    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')

      //   是否为发布模式
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
