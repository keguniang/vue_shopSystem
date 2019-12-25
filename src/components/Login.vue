<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 表单区域 -->
      <el-form
        label-width="0"
        class="form_login"
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="name">
          <el-input
            placeholder="请输入姓名"
            prefix-icon="iconfont icon-icon-username"
            clearable
            v-model="loginForm.name"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="pwd">
          <el-input
            placeholder="请输入密码"
            prefix-icon="iconfont icon-lock"
            show-password
            clearable
            v-model="loginForm.pwd"
            prop="pwd"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <div class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        name: '',
        pwd: ''
      },
      // 表单验证规则对象
      rules: {
        // 验证用户名是否合法
        name: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, massage: '长度在3到5个字符', trigger: 'blur' }
        ],
        pwd: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 15, massage: '长度在6到15个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单输入框内容
    reset() {
      this.$refs.loginFormRef.resetFields()
    },
    // 表单登录的预验证
    login() {
      this.$refs.loginFormRef.validate(async validate => {
        // 若没有通过表单验证
        if (!validate) return
        const res = await this.axios.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登陆失败')
        this.$message.success('登陆成功')
        /* 1. 将成功之后的token ，保存到客户端的 sessionStorage 中
             1.1 项目中除了登录之外的 其他 API，必须在登陆之后才能访问
             1.2 token 只应在当前网站打开期间生效，所以将token 保存在sessionStorage中，localStorage是持久生效的
            2. 通过编程式导航跳转到后台主页，路由地址时 /home */
        sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
  display: flex;
  justify-content: center;
  align-items: center;
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 10px;
    position: relative;
    // 头像
    .avatar_box {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    // 登录表单
    .form_login {
      width: 100%;
      position: absolute;
      bottom: 0;
      padding: 10px;
      box-sizing: border-box;
      el-input {
        color: #000;
      }
      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
