<script setup>
import { ref, onMounted } from 'vue'
import { Delete, Edit, Download, Notebook } from '@element-plus/icons-vue'
import {
  tokenPageListService,
  tokenDeleteService,
  tokenQuaryListService,
  tokenUpdateExportedService,
  tokenUpdateService,
  tokenAddService
} from '@/api/token.js'
import TokenLogs from './components/TokenLogs.vue'
//子组件实例
const keyAddLogsRef = ref()

//表格数据
const tokenTableData = ref([])
//查询数据
const queryData = ref()
//表格加载
const tableLoading = ref(true)
//分页数据
const page = ref({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  isExported: 'false'
})
//多选数据
const selectedData = ref([])

//查询操作
const onQueryData = async () => {
  if (!queryData.value) return
  const res = await tokenQuaryListService(queryData.value)
  tokenTableData.value = res.data
}
//重置查询
const onResetData = () => {
  queryData.value = ''
  onPageChange()
}

//多选
const onSelection = (e) => {
  selectedData.value = e
}
//批删
const onMulDelete = async () => {
  if (selectedData.value.length === 0) {
    ElMessage.warning('请选择要删除的授权')
    return
  }
  const delIds = selectedData.value.map((item) => item.id)
  const res = await tokenDeleteService(delIds.join(','))
  ElMessage.success(res.message)
  onPageChange()
  selectedData.value = []
}

//单删
const onDelete = async (row) => {
  const res = await tokenDeleteService(row.id)
  ElMessage.success(res.message)
  onPageChange()
}
//打开编辑弹窗
const onOpenEditDialog = (row) => {
  editFormModel.value = { ...row }
  editDialogVisible.value = true
}

//分页变化
const onPageChange = async () => {
  tableLoading.value = true
  const res = await tokenPageListService(page.value)
  tokenTableData.value = res.data.list
  page.value.total = res.data.total
  setTimeout(() => {
    tableLoading.value = false
  }, 300)
}

//初始化
onMounted(async () => {
  //初始化表格数据
  tableLoading.value = true
  const res = await tokenPageListService(page.value)
  tokenTableData.value = res.data.list
  page.value.total = res.data.total
  setTimeout(() => {
    tableLoading.value = false
  }, 300)
})

//多选弹窗
const multDialogVisible = ref(false)
//编辑弹窗
const editDialogVisible = ref(false)

//表单相关

const editFormRef = ref()
const editFormModel = ref({
  tokenCode: '',
  days: 0
})
const editFormRules = {
  tokenCode: [
    { required: true, message: '授权码不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: 'Length should be 3 to 20', trigger: 'blur' }
  ],
  days: [
    { required: true, message: '天数不能为空', trigger: 'blur' },
    { type: 'number', min: 0, max: 3650, message: '请输入0~3650的数字', trigger: 'blur' }
  ]
}
const addFormRef = ref()
const addFormModel = ref({
  count: 1,
  days: 365
})
const addFormRules = {
  count: [
    { required: true, message: '个数不能为空', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '请输入0~100的数字', trigger: 'blur' }
  ],
  days: [
    { required: true, message: '天数不能为空', trigger: 'blur' },
    { type: 'number', min: 0, max: 3650, message: '请输入0~3650的数字', trigger: 'blur' }
  ]
}
const onResetFrom = () => {
  editDialogVisible.value = false
  addFormModel.value = {
    count: 1,
    days: 365
  }
  if (addFormRef.value) addFormRef.value.clearValidate()
  if (editFormRef.value) editFormRef.value.clearValidate()
}

//add
const onAddCategory = async () => {
  await addFormRef.value.validate()
  const res = await tokenAddService(addFormModel.value)
  ElMessage.success(res.message)
  onResetFrom()
}

const onUpdateCategory = async () => {
  await editFormRef.value.validate()
  const res = await tokenUpdateService(editFormModel.value)
  ElMessage.success(res.message)
  onResetFrom()
}

//导出
const onDownload = async () => {
  console.log('下载')
  const arr = selectedData.value.map((item) => item.tokenCode)
  // 将数组转换为文本，每个元素占一行
  const text = arr.join('\n')
  // 创建一个 Blob 对象，表示一个不可变、原始数据的类文件对象
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  // 创建一个指向该 Blob 对象的 URL
  const url = URL.createObjectURL(blob)
  // 创建一个隐藏的 <a> 标签用于下载
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'tokens.txt') // 设置下载文件的名称
  document.body.appendChild(link)
  // 触发点击事件开始下载
  link.click()
  // 移除临时的 <a> 标签
  document.body.removeChild(link)
  // 释放 URL 对象
  URL.revokeObjectURL(url)

  const arr2 = selectedData.value.map((item) => {
    return {
      id: item.id,
      isExported: true
    }
  })
  const res = await tokenUpdateExportedService(arr2)
  ElMessage.success(res.message)
}
</script>
<template>
  <page-container title="授权码管理">
    <template #extra>
      <el-button type="primary" @click="keyAddLogsRef.openLog()" plain>
        <el-icon><Notebook /></el-icon>日志
      </el-button>

      <el-button type="primary" @click="onOpenEditDialog" plain>
        <el-icon><Edit /></el-icon>添加授权码
      </el-button>

      <el-button
        type="primary"
        @click="multDialogVisible = true"
        :disabled="selectedData.length > 0 ? false : true"
        plain
      >
        <el-icon><Edit /></el-icon>批量操作
      </el-button>
    </template>
    <!-- 查询和筛选 -->
    <el-row gutter="25">
      <el-col :span="4" :offset="0">
        <div>
          <el-input v-model="queryData" placeholder="请输入授权码"></el-input>
        </div>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" @click="onQueryData" plain>查询</el-button>
        <el-button type="primary" @click="onResetData" plain>重置</el-button>
      </el-col>
    </el-row>

    <!-- 表格区域 -->
    <el-table
      v-loading="tableLoading"
      :data="tokenTableData"
      style="width: 100%"
      @selection-change="onSelection"
    >
      <el-table-column type="selection" label="多选框" />
      <el-table-column label="id" prop="id" width="80" />
      <el-table-column label="授权码" prop="tokenCode" />
      <el-table-column label="激活天数" prop="days" :formatter="(t) => t.days + ' 天'" />
      <!--       <el-table-column>
        <template #header>
          导出状态:
          <el-select
            v-model="page.isExported"
            @change="onPageChange"
            clearable
            placeholder="是否导出"
            style="width: 30%"
          >
            <el-option label="已导出" value="true" />
            <el-option label="未导出" value="false" />
          </el-select>
        </template>
        <template #default="scope">
          <div v-if="scope.row.isExported">
            <el-icon style="color: green"><Select /></el-icon>
          </div>
          <div v-else>未导出</div>
        </template>
      </el-table-column> -->

      <el-table-column label="操作" fixed="right" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="onOpenEditDialog(scope.row)" plain>
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-popconfirm title="确认删除吗?" @confirm="onDelete(scope.row)">
            <template #reference>
              <el-button size="small" type="danger" plain>
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <div>
      <el-pagination
        v-model:current-page="page.currentPage"
        v-model:page-size="page.pageSize"
        :page-sizes="[10, 20, 40]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        @current-change="onPageChange"
        @size-change="onPageChange"
      />
    </div>
  </page-container>
  <!-- 添加弹窗 -->
  <!-- 批量操作 -->
  <el-dialog
    v-model="multDialogVisible"
    width="15%"
    title="批量操作"
    center
    :modal="false"
    append-to-body="true"
  >
    <p>请选择要进行的操作：</p>
    <div>
      <el-popconfirm title="确认删除吗?" @confirm="onMulDelete(), (multDialogVisible = false)">
        <template #reference>
          <el-button type="danger" plain>
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </template>
      </el-popconfirm>
      <el-button type="primary" plain @click="onDownload">
        <el-icon><Download /></el-icon>导出
      </el-button>
    </div>
  </el-dialog>

  <el-dialog
    @close="onResetFrom"
    v-model="editDialogVisible"
    :title="editFormModel.id ? '编辑授权码' : '添加授权码'"
    width="30%"
  >
    <el-form
      v-if="editFormModel.id"
      ref="editFormRef"
      :model="editFormModel"
      :rules="editFormRules"
      label-width="100px"
      style="padding-right: 30px"
    >
      <el-form-item label="授权码" prop="tokenCode" placeholder="请输入设备码">
        <el-input v-model="editFormModel.tokenCode"></el-input>
      </el-form-item>
      <el-form-item label="激活天数" prop="days">
        <el-input v-model.number="editFormModel.days"></el-input>
      </el-form-item>
    </el-form>

    <el-form
      v-else
      ref="addFormRef"
      :model="addFormModel"
      :rules="addFormRules"
      label-width="100px"
      style="padding-right: 30px"
    >
      <el-form-item label="生成个数" prop="count" placeholder="请输入设备码">
        <el-input v-model.number="addFormModel.count"></el-input>
        <el-button type="primary" size="small" @click="addFormModel.count = 10">10个</el-button>
        <el-button type="primary" size="small" @click="addFormModel.count = 20">20个</el-button>
        <el-button type="primary" size="small" @click="addFormModel.count = 100">100个</el-button>
      </el-form-item>
      <el-form-item label="激活天数" prop="days">
        <el-input v-model.number="addFormModel.days"></el-input>
        <el-button type="primary" size="small" @click="addFormModel.days = 3">3天</el-button>
        <el-button type="primary" size="small" @click="addFormModel.days = 31">1个月</el-button>
        <el-button type="primary" size="small" @click="addFormModel.days = 365">1年</el-button>
        <el-button type="primary" size="small" @click="addFormModel.days = 3650">永久</el-button>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onResetFrom">取消</el-button>
        <el-button type="primary" @click="editFormModel.id ? onUpdateCategory() : onAddCategory()">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
  <Token-Logs ref="keyAddLogsRef" />
</template>
<style scoped></style>
