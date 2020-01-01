<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- alert警告 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tabs标签 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="tabsBeforeLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{ expandTrigger: 'hover',label:'cat_name',value:'cat_id',children:'children' }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 表单项循环 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 表单项循环 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input :value="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="actionUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="uploadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 确认添加按钮 -->
            <el-button type="primary" @click="addGoods" class="add_btn">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%" :before-close="handleClose">
      <img :src="imgUrl" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 步骤条索引
      activeIndex: '0',
      //   表单数据
      addForm: {
        goods_name: '',
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        // // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
        attrs: []
      },
      //   表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      //   分类列表数据
      cateList: [],
      // 动态参数列表
      manyTableData: [],
      // 静态参数列表
      onlyTableData: [],
      // 图片上传的后台服务器路径
      actionUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传的header
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片
      previewVisible: false,
      imgUrl: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   获得商品分类列表
    async getCateList() {
      const res = await this.axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data
    },
    // 级联选择器选项变化
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.$notify({
          title: '警告',
          message: '请选择第三级分类',
          type: 'warning'
        })
        this.addForm.goods_cat = []
      }
    },
    // 切换标签页之前的验证
    tabsBeforeLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$notify({
          title: '警告',
          message: '请选择三级分类之后再下一步',
          type: 'warning'
        })
        return false
      }
    },
    // 获取参数列表（静态/动态）
    async getParamsList(type) {
      // 发起获取动态参数请求
      const res = await this.axios.get(`categories/${this.catId}/attributes`, {
        params: {
          sel: type
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      console.log(res.data)
      if (type === 'many') {
        res.data.forEach(function(item) {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // tab 被选中时触发
    tabClick() {
      switch (this.activeIndex) {
        case '1':
          this.getParamsList('many')
          console.log(this.manyTableData)
          break
        case '2':
          this.getParamsList('only')
          break
      }
    },
    // 图片预览
    handlePreview(file) {
      this.previewVisible = true
      this.imgUrl = file.response.data.url
    },
    // 图片删除
    handleRemove(file) {
      console.log(file)
      // 1. 获取被删除图片的URL
      var url = file.response.data.tmp_path
      // 2. 找到该图片在数组pics中的索引
      var index = this.addForm.pics.findIndex(item => item.pic === url)
      // 在该数组中删除该元素
      this.addForm.pics.splice(index)
    },
    // 图片上传成功
    uploadSuccess(response) {
      var pic = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(pic)
      console.log(this.addForm)
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    // 添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async validate => {
        if (!validate) {
          return null
        }
        // 执行添加商品操作  实现对象深拷贝
        var form = JSON.parse(JSON.stringify(this.addForm))
        form.goods_cat = form.goods_cat.join(',')

        // 处理动态参数
        this.manyTableData.forEach(item => {
          var attr = {
            attr_id: item.attr_name,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(attr)
        })

        // 处理静态属性
        this.onlyTableData.forEach(item => {
          var attr = {
            attr_id: item.attr_name,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(attr)
        })
        form.attrs = this.addForm.attrs

        console.log(form)
        // 发起添加请求
        const res = await this.axios.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    catId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.add_btn {
  margin-top: 15px;
}
</style>
