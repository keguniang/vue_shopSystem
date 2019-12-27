<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 权限列表表格 -->
      <el-table :data="rolesList" style="width: 100%" stripe border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdBottom', i === 0? 'bdTop':'','vcenter']"
              v-for="(item,i) in scope.row.children"
              :key="item.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="closeTagById(scope.row,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 如果是第一个索引不加上边框 -->
                <!-- 二级权限 -->
                <el-row
                  :class="[i2 === 0? '' : 'bdTop','vcenter']"
                  v-for="(secItem,i2) in item.children"
                  :key="secItem.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="closeTagById(scope.row,secItem.id)"
                    >{{secItem.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      :class="[i3 === 0? '' : 'bdTop']"
                      type="warning"
                      v-for="(thiItem,i3) in secItem.children"
                      :key="thiItem.id"
                      closable
                      @close="closeTagById(scope.row,thiItem.id)"
                    >{{thiItem.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="编辑角色" placement="top-start" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="editRole(scope.row)"
              >编辑</el-button>
            </el-tooltip>

            <!-- 删除按钮 -->
            <el-tooltip effect="dark" content="删除角色" placement="top-start" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="delRole(scope.row.id)"
              >删除</el-button>
            </el-tooltip>

            <!-- 分配角色按钮   enterable表示鼠标是否可进入到 tooltip 中-->
            <el-tooltip effect="dark" content="分配权限" placement="top-start" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRights(scope.row)"
              >分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addRoleClose">
      <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleRef" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleSure">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editRoleClose">
      <el-form :model="editRoleForm" :rules="addRoleRules" ref="editRoleRef" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleCancle">取 消</el-button>
        <el-button type="primary" @click="editRoleSure(editRoleForm.id)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightsDialogVisible" width="50%">
      <!-- 树形控件 -->
      <!-- node-key="id" 选中复选框，即选中了该项的id值 -->
      <el-tree
        :data="rightsList"
        show-checkbox
        :props="treeProps"
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRightsSure ">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 权限列表数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点数组
      defKeys: [],
      // 分配权限的当前用户的id
      roleId: '',
      // 控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      editDialogVisible: false,
      // 添加角色表单
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色表单
      editRoleForm: {},
      // 表单验证规则
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { min: 0, max: 30, message: '长度在 2 到30 个字符', trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRightsDialogVisible: false
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 得到角色列表数据
    async getRolesList() {
      const res = await this.axios.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 添加角色对话框关闭
    addRoleClose() {
      this.$refs.addRoleRef.resetFields()
    },
    // 修改角色对话框关闭
    editRoleClose() {
      this.$refs.editRoleRef.resetFields()
    },
    // 添加角色确定按钮
    addRoleSure() {
      // 1 进行表单预验证
      this.$refs.addRoleRef.validate(async validata => {
        // 预验证失败
        if (!validata) return
        // 2 发起添加角色的请求
        const res = await this.axios.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        // 隐藏添加角色对话框
        this.addDialogVisible = false
        // 重新获取角色列表
        this.getRolesList()
      })
    },
    // 删除角色
    async delRole(id) {
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
      const res = await this.axios.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      // 重新获取角色列表
      this.getRolesList()
    },
    // 编辑角色
    editRole(roleInfo) {
      console.log(roleInfo)
      this.editRoleForm = roleInfo
      this.editDialogVisible = true
    },
    // 取消编辑角色
    editRoleCancle() {
      this.editDialogVisible = false
      this.getRolesList()
    },
    // 提交编辑角色
    async editRoleSure(id) {
      const res = await this.axios.put(`roles/${id}`, {
        roleName: this.editRoleForm.roleName,
        roleDesc: this.editRoleForm.roleDesc
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('编辑角色失败')
      }
      this.$message.success('编辑角色成功')
      // 重新获取角色列表
      this.getRolesList()
      // 隐藏对话框
      this.editDialogVisible = false
    },
    // 根据id删除标签事件
    closeTagById(role, rightId) {
      // 弹出提示框确认删除
      this.$confirm('此操作将永久删除该标签, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const res = await this.axios.delete(
            `roles/${role.id}/rights/${rightId}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除权限失败')
          }
          this.$message.success('删除权限成功')
          // 重新获取角色列表数据会折叠起来，体验不好，所以采取直接赋值的方式
          // this.getRolesList()
          role.children = res.data
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 分配权限
    async setRights(role) {
      this.roleId = role.id
      const res = await this.axios.get(`rights/tree`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      console.log(this.rightsList)
      // 首先清空defKeys数组
      this.defKeys = []
      // 默认打开已有的权限
      this.getLeafKeys(role, this.defKeys)
      // 打开对话框
      this.setRightsDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys数组中
    getLeafKeys(node, arr) {
      // 如果是三级节点，则!node.children为true
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果不是三级节点，递归调用该函数循环它的子节点
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 确认分配权限
    async setRightsSure() {
      // 获取到权限 ID 列表（字符串）
      var arr = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      var rids = arr.join(',')
      // 发起分配权限请求
      const res = await this.axios.post(`roles/${this.roleId}/rights`, {
        rids: rids
      })
      if (res.meta.status !== 200) {
        return this.$message.error('角色授权失败')
      }
      this.$message.success('角色授权成功')
      // 重新获取角色列表
      this.getRolesList()
      // 隐藏分配权限对话框
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdTop {
  border-top: 1px solid #eee;
}
.bdBottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
