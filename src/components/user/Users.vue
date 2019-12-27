<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card shadow="hover">
      <!-- 栅格布局-->
      <el-row :gutter="20">
        <!-- 搜索框部分 -->
        <el-col :span="10">
          <el-input
            placeholder="请输入内容"
            clearable
            v-model="userQueryInfo.query"
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加用户按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <!--:data表示表格对应的数据源  label表示该列的标题，prop表示该列对应的数据  -->
      <el-table :data="usersList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <!-- 这里prop="mg_state" 因为mg_state是bool类型，在页面上并不显示，所以用作用域插槽实现 -->
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- {{scope.row}} 显示出这一行对应的所有数据 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="修改内容" placement="top-start" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row)"
              ></el-button>
            </el-tooltip>

            <!-- 删除按钮 -->
            <el-tooltip effect="dark" content="删除用户" placement="top-start" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteUser(scope.row.id)"
              ></el-button>
            </el-tooltip>

            <!-- 分配角色按钮   enterable表示鼠标是否可进入到 tooltip 中-->
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userQueryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="userQueryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="usersTotal"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <!-- 主体内容 -->
      <el-form :model="addUserForm" :rules="addUserRules" ref="addUserRef" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 主体内容 -->
      <el-form :model="editUserForm" :rules="addUserRules" ref="editUserRef" label-width="90px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser(editUserForm.id)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 为用户分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClose"
    >
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleSure">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    let checkEmail = (rule, value, cb) => {
      var regEmail = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证联系方式的规则
    var checkMobile = (rule, value, cb) => {
      var regMobile = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的联系方式'))
    }
    return {
      // 获取用户列表的查询参数
      userQueryInfo: {
        query: '', // 查询参数
        pagenum: 1, // 当前页码
        pagesize: 5 // 每页显示条数
      },
      // 用户列表
      usersList: [],
      // 角色列表
      roleList: [],
      // 角色id
      roleId: '',
      // 用户总数
      usersTotal: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 添加用户的表单数据
      addUserForm: {
        username: 'keke1',
        password: '123456',
        email: '824371324@qq.com',
        mobile: '15629103881'
      },
      // 修改用户的表单数据
      editUserForm: {},
      // 添加用户的验证规则
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            message: '请输入合法的邮箱',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '请输入合法的联系方式',
            trigger: 'blur'
          }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 用户信息
      userInfo: {},
      // 为当前被选中的el-option的 value 属性值
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 获取用户列表数据
    async getUserList() {
      // 请求参数是params的值
      const res = await this.axios.get('users', { params: this.userQueryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      } else {
        this.usersList = res.data.users
        this.usersTotal = res.data.total
      }
    },
    // 一页多少条改变事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.userQueryInfo.pagesize = newSize
      // 重新发起用户请求
      this.getUserList()
    },
    // 目前页数改变事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.userQueryInfo.pagenum = newPage
      // 重新发起用户请求
      this.getUserList()
    },
    // 更新用户状态
    async userStateChange(userInfo) {
      // console.log(userInfo)
      const res = await this.axios.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        // 让用户状态恢复
        userInfo.mg_state = !userInfo.mg_state
        this.$message.error('用户状态更新失败')
      }
      this.$message.success('用户状态更新成功')
    },
    // 关闭添加用户对话框事件
    addDialogClose() {
      // resetFields对整个表单进行重置包含表单内容和校验结果
      // clearValidate仅清除校验结果
      // this.$refs.addUserRef.clearValidate()
      this.$refs.addUserRef.resetFields()
    },
    // 确定添加用户按钮
    addUser() {
      // 1. 进行表单预验证
      this.$refs.addUserRef.validate(async validate => {
        // 预验证失败
        if (!validate) return
        // 2 发起添加用户的请求
        const res = await this.axios.post('users', this.addUserForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 隐藏添加用户对话框
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    // 显示修改用户信息对话框
    // 这里可以通过id 发送请求获取用户数据，也可以直接用表格中的数据赋值
    async showEditDialog(userInfo) {
      // 显示对话框
      this.editDialogVisible = true
      // 根据 ID 查询用户信息
      // const res = await this.axios.get(`users/${id}`, {
      //   params: {
      //     id
      //   }
      // })
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取用户信息失败')
      // }
      // this.$message.success('获取用户信息成功')
      // console.log(res)
      this.editUserForm = userInfo
    },
    // 修改用户信息按钮
    editUser(id) {
      // 1. 进行表单预验证
      this.$refs.editUserRef.validate(async validate => {
        // 预验证失败
        if (!validate) return
        // 2 发起添加用户的请求
        const res = await this.axios.put(`users/${id}`, this.editUserForm)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户失败')
        }
        this.$message.success('更新用户成功')
        // 3 隐藏添加用户对话框
        this.editDialogVisible = false
        // 4 重新获取用户列表
        this.getUserList()
      })
    },
    // 关闭修改用户信息对话框事件
    editDialogClose() {
      this.$refs.editUserRef.resetFields()
    },
    // 删除用户
    async deleteUser(id) {
      // 弹窗询问用户是否删除该用户
      // 确认删除，返回字符串confirm,取消删除，返回字符串cancel
      const confirmRes = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmRes === 'cancel') {
        return this.$message.info('已取消删除')
      }
      const res = await this.axios.delete(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除更新用户失败')
      }
      this.$message.success('删除用户成功')
      // 3 重新获取用户列表
      this.getUserList()
    },
    // 为用户分配角色
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 获取角色列表
      const res = await this.axios.get(`roles`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      // 显示对话框
      this.setRoleDialogVisible = true
    },
    // 用户分配角色确定按钮
    async setRoleSure() {
      if (!this.selectedRoleId) {
        return this.$message.warning('请选择要分配的角色')
      }
      const res = await this.axios.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配用户角色失败')
      }
      this.$message.success('分配用户角色成功')
      // 隐藏对话框
      this.setRoleDialogVisible = false
      // 重新获取用户列表数据
      this.getUserList()
    },
    // 关闭分配角色对话框
    setRoleDialogClose() {
      // 把下拉框中的内容清空
      this.selectedRoleId = ''
    }
  }
}
</script>
