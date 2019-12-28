<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格树形结构 -->
      <tree-table
        :data="goodsCategories"
        :columns="columns"
        border
        show-index
        index-text="#"
        :selection-type="false"
        :expand-type="false"
        class="treeTable"
      >
        <!-- 是否有效  该列的自定义模板 -->
        <template slot="isValidate" slot-scope="scope">
          <div>
            <i :class="scope.row.cat_deleted === true?'el-icon-error':'el-icon-success'"></i>
          </div>
        </template>
        <!-- 排序  该列的自定义模板 -->
        <template slot="catLevel" slot-scope="scope">
          <div>
            <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
            <el-tag v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </div>
        </template>
        <!-- 操作  该列的自定义模板 -->
        <template slot="operation" slot-scope="scope">
          <!-- 修改按钮 -->
          <el-tooltip effect="dark" content="编辑角色" placement="top-start" :enterable="false">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editCate(scope.row)"
            >编辑</el-button>
          </el-tooltip>

          <!-- 删除按钮 -->
          <el-tooltip effect="dark" content="删除角色" placement="top-start" :enterable="false">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delCate(scope.row.cat_id)"
            >删除</el-button>
          </el-tooltip>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加商品分类对话框 -->
    <el-dialog
      title="添加商品分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      :before-close="handleClose"
      @close="addCateDialogClose"
    >
      <el-form ref="addCateRef" :model="addCateForm" :rules="addCateRules" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!--options数据源  props级联选择器的配置属性-->
          <el-cascader
            v-model="selectedGoodsCate"
            :options="parentCatesList"
            :props="{ expandTrigger: 'hover',label:'cat_name',value:'cat_id',checkStrictly :true}"
            @change="handleChange"
            show-all-levels
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateSure">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑商品分类对话框 -->
    <el-dialog
      title="添加商品分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      :before-close="handleClose"
      @close="editCateDialogClose"
    >
      <el-form ref="editCateRef" :model="editCateForm" :rules="addCateRules" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateSure()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询商品列表参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表数据
      goodsCategories: [],
      // 商品分类的总数
      total: 0,
      // 表格各列的配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'isValidate',
          // 对应列标题的对齐方式
          headerAlign: 'center',
          // 对应列内容的对齐方式
          align: 'center'
        },
        {
          label: '排序',
          prop: 'cat_level',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'catLevel',
          headerAlign: 'center',
          align: 'center'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'operation'
        }
      ],
      // 控制商品分类对话框的显示与隐藏
      addCateDialogVisible: false,
      editCateDialogVisible: false,
      // 添加商品分类表单数据
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      // 添加商品分类表单规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ]
      },
      // 被选中的商品分类级别
      selectedGoodsCate: [],
      // 父级分类列表
      parentCatesList: [],
      // 编辑对话框的表格数据
      editCateForm: {
        cat_name: '',
        cat_id: ''
      }
    }
  },
  created() {
    this.getCategories()
  },
  methods: {
    // 获取商品分类列表
    async getCategories() {
      const res = await this.axios.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.total = res.data.total
      this.goodsCategories = res.data.result
    },

    // 删除分类按钮
    async delCate(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const res = await this.axios.delete(`categories/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除商品分类失败')
          }
          this.$message.success('删除商品分类成功')
          this.getCategories()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 分页的每页页数变化
    handleSizeChange(num) {
      this.queryInfo.pagesize = num
      this.getCategories()
    },
    // 分页的pagenum变化
    handleCurrentChange(num) {
      this.queryInfo.pagenum = num
      this.getCategories()
    },
    // 添加商品分类
    addCate() {
      // 首先获取父级分类列表数据
      this.getParentCatesList()
      // 再显示对话框
      this.addCateDialogVisible = true
    },
    // 关闭对话框的触发事件
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    // 添加商品分类对话框关闭
    addCateDialogClose() {
      this.$refs.addCateRef.resetFields()
      // 重置级联选择框
      this.selectedGoodsCate = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 级联选择器的选择内容改变时
    handleChange(value) {
      // 说明有选中父级分类,反之没有选任何父级分类
      if (value.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = value[value.length - 1]
        // 为当前等级赋值
        this.addCateForm.cat_level = value.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 获取父级分类列表数据
    async getParentCatesList() {
      const res = await this.axios.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级商品分类列表失败')
      }
      this.parentCatesList = res.data
    },
    // 确定添加分类按钮
    addCateSure() {
      // 表单预验证
      this.$refs.addCateRef.validate(async validate => {
        // 预验证失败
        if (!validate) return
        // 发起请求
        console.log(this.addCateForm)
        const res = await this.axios.post('categories', this.addCateForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品分类失败')
        }
        this.$message.success('添加商品分类成功')

        // 重新刷新商品分类列表
        this.getCategories()
        this.addCateDialogVisible = false
      })
    },
    // 编辑分类按钮
    editCate(cateInfo) {
      this.editCateForm.cat_name = cateInfo.cat_name
      this.editCateForm.cat_id = cateInfo.cat_id
      this.editCateDialogVisible = true
    },
    // 编辑添加分类按钮
    async editCateSure(cateInfo) {
      const res = await this.axios.put(
        `categories/${this.editCateForm.cat_id}`,
        {
          cat_name: this.editCateForm.cat_name
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('编辑商品分类失败')
      }
      this.$message.success('编辑商品分类成功')
      this.getCategories()
      this.editCateDialogVisible = false
    },
    // 关闭编辑框
    editCateDialogClose() {
      this.$refs.editCateRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-icon-success {
  color: green;
}
.el-icon-error {
  color: red;
}
</style>
