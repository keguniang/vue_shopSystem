
<template>
  <el-container>
    <!-- 页面头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体部分 -->
    <el-container>
      <!-- 左侧侧边栏 -->
      <el-aside :width="!isCollapse? '200px' : '64px'">
        <div class="toggle_collapse" @click="collapseMenu">|||</div>
        <!-- 侧边菜单栏区域 -->
        <el-menu
          background-color="#323744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="this.$route.path"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + '' " v-for="item in meunList" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path "
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="activeNav"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体区域 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      meunList: [],
      //   字体图标
      iconsObj: {
        '125': 'iconfont icon-person',
        '103': 'iconfont icon-zhengfangti',
        '101': 'iconfont icon-gouwudai',
        '102': 'iconfont icon-dingdan',
        '145': 'iconfont icon-shujutongji'
      },
      //   是否折叠菜单
      isCollapse: false
    }
  },
  created() {
    this.getMenuList()
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取左侧菜单列表数据
    async getMenuList() {
      const res = await this.axios.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.meunList = res.data
    },
    // 折叠左侧菜单
    collapseMenu() {
      this.isCollapse = !this.isCollapse
    },
    activeNav() {
      console.log(this.$route.path)
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
  .el-header {
    background-color: #373c41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    color: #fff;
    font-size: 20px;
    div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #323744;
    .toggle_collapse {
      background-color: #485164;
      height: 30px;
      line-height: 30px;
      color: #fff;
      letter-spacing: 0.3em;
      text-align: center;
    }
    .el-menu {
      border: none;
    }
  }
  .el-main {
    background-color: #eaedf2;
  }
}
.iconfont {
  color: #8f949b;
  margin-right: 10px;
  font-size: 16px;
}
</style>
