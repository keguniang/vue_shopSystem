<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning"></el-alert>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style lang="less" scoped>
</style>
