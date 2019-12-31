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
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <h4>选择商品分类:</h4>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catesList"
            :props="catesProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- Tab 标签页 -->
      <el-tabs v-model="activeTabName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" stripe style="width: 100%">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="item.attr_id"
                  closable
                  @close="tagClose(scope.row,i)"
                >{{item}}</el-tag>
                <!-- 添加新tag输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加新tag按钮-->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-tooltip effect="dark" content="修改" placement="top-start" :enterable="false">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    @click="editParams(scope.row)"
                  >修改</el-button>
                </el-tooltip>

                <!-- 删除按钮 -->
                <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="delParams(scope.row.attr_id)"
                  >删除</el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态参数" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" stripe style="width: 100%">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="item.attr_id"
                  closable
                  @close="tagClose(scope.row,i)"
                >{{item}}</el-tag>
                <!-- 添加新tag输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加新tag按钮-->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-tooltip effect="dark" content="修改" placement="top-start" :enterable="false">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    @click="editParams(scope.row)"
                  >修改</el-button>
                </el-tooltip>

                <!-- 删除按钮 -->
                <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="delParams(scope.row.attr_id)"
                  >删除</el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加按钮弹出的对话框 添加动态参数和添加静态属性的弹出对话框都是这个-->
    <el-dialog
      :title="'添加'+addTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      :before-close="handleClose"
      @close="addDialogClose"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="addTitle + ':'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑按钮弹出的对话框 添加动态参数和添加静态属性的弹出对话框都是这个-->
    <el-dialog
      :title="'修改'+addTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      :before-close="handleClose"
      @close="editDialogClose"
    >
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="addTitle + ':'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamsSure">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catesList: [],
      // 级联选择框选中的商品分类Id
      selectedCateKeys: [],
      // 级联选择框的配置规则
      catesProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 标签页的选中名称
      activeTabName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 添加按钮的对话框显示与隐藏
      addDialogVisible: false,
      editDialogVisible: false,
      // 添加表格的表单数据对象
      addForm: {
        attr_name: ''
      },
      editForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const res = await this.axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据列表失败')
      }
      this.catesList = res.data
    },
    // 关闭对话框之前的确认事件
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    // 级联选择框中选中的值发生变化
    async handleChange() {
      // console.log(this.selectedCateKeys)
      this.getParamsData()
    },
    // tab 标签切换时的触发事件
    handleTabClick() {
      // console.log(this.activeTabName)
      this.getParamsData()
    },
    // 获取参数数据
    async getParamsData() {
      // 数组长度为3说明选中的是3级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        // 清空动态参数表格和静态属性表格
        this.manyTableData = []
        this.onlyTableData = []
        // 显示警告通知
        return this.$notify({
          title: '警告',
          message: '请选择第三级分类',
          type: 'warning'
        })
      }
      // 选中的是3级分类，发起请求
      const res = await this.axios.get(`categories/${this.catId}/attributes`, {
        params: {
          sel: this.activeTabName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 要有各自的两个属性，否则共用
        // 输入框的显示与隐藏
        item.inputVisible = false
        // 输入框中的值
        item.inputValue = ''
      })
      // 选中的tab 是动态参数
      if (this.activeTabName === 'many') {
        this.manyTableData = res.data
      } else {
        // 静态属性
        this.onlyTableData = res.data
      }
    },
    // 修改参数
    editParams(paramsInfo) {
      this.editForm.attr_name = paramsInfo.attr_name
      this.editForm.attr_id = paramsInfo.attr_id
      this.editDialogVisible = true
    },
    // 修改参数对话框的确定按钮
    async editParamsSure() {
      const res = await this.axios.put(
        `categories/${this.catId}/attributes/${this.editForm.attr_id}`,
        {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeTabName
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('编辑参数失败')
      }
      this.$message.success('编辑参数成功')
      this.getParamsData()
      this.editDialogVisible = false
    },
    // 删除参数
    delParams(id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const res = await this.axios.delete(
            `categories/${this.catId}/attributes/${id}}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除参数失败')
          }
          this.$message.success('删除参数成功')
          this.getParamsData()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 添加参数的事件
    addParams() {
      this.$refs.addFormRef.validate(async validate => {
        if (!validate) return
        const res = await this.axios.post(
          `categories/${this.catId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeTabName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    // tag输入框中输入内容之后按enter或者失去焦点后触发
    async handleInputConfirm(row) {
      // 输入的是空格，不合法需要清空，不做添加tag操作
      if (row.inputValue.trim().length === 0) {
        // 从输入框变成按钮
        row.inputVisible = false
        // 重置输入框中的值
        row.inputValue = ''
        return null
      }
      // 如果没有return 则输入的是合法的值
      row.attr_vals.push(row.inputValue.trim())
      // 从输入框变成按钮
      row.inputVisible = false
      // 重置输入框中的值
      row.inputValue = ''
      // 发起添加请求
      this.saveAttrVals(row)
    },
    async saveAttrVals(row) {
      const res = await this.axios.put(
        `categories/${this.catId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    },
    // tag关闭事件
    tagClose(row, i) {
      row.attr_vals.splice(i)
      this.saveAttrVals(row)
    },
    // 由按钮变成输入框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // this.$nextTick的作用：当页面上元素被重新渲染之后，（button要变回input,否则页面上还没有input这个DOM，调用focus会出错）才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  // 计算属性
  computed: {
    // 如果级联选择框中没有选中第三级商品，则按钮禁用
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 第三级分类的id
    catId() {
      if (this.selectedCateKeys.length !== 3) {
        return null
      }
      return this.selectedCateKeys[2]
    },
    // 对话框的标题
    addTitle() {
      if (this.activeTabName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
h4 {
  display: inline-block;
  margin-right: 10px;
}
.el-cascader {
  width: 250px;
}
.input-new-tag {
  width: 90px;
}
</style>
