<script setup>
import { ref } from 'vue'
import { logPageListService, logDeleteService } from '@/api/token.js'
import { formatTime2 } from '@/utils/format.js'
import useClipboard from 'vue-clipboard3'
const { toClipboard } = useClipboard()
const copy = async (msg) => {
  try {
    // 复制
    await toClipboard(msg)
    // 复制成功
    ElMessage.success('复制成功')
  } catch (e) {
    // 复制失败
  }
}
//表格加载
const tableLoading = ref(true)
//分页数据
const page = ref({
  total: 0,
  pageSize: 5,
  currentPage: 1
})
//多选数据
const selectedData = ref([])
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
  const res = await logDeleteService(delIds.join(','))
  ElMessage.success(res.data.message)
  onPageChange()
  selectedData.value = []
}
//单删
const onDelete = async (row) => {
  const res = await logDeleteService(row.id)
  ElMessage.success(res.data.message)
  onPageChange()
}
//分页变化
const onPageChange = async () => {
  tableLoading.value = true
  const res = await logPageListService(page.value)
  LogTableData.value = res.data.rows
  page.value.total = res.data.total
  setTimeout(() => {
    tableLoading.value = false
  }, 300)
}

//日志弹窗
const logDialogVisible = ref(false)

const LogTableData = ref([])

const openLog = async () => {
  logDialogVisible.value = true
  onPageChange()
}
defineExpose({
  openLog
})

//token文本列表弹窗
const logTokenDialogVisible = ref(false)
const tokenData = ref({})
const onOpenTokenDialog = (row) => {
  logTokenDialogVisible.value = true

  const arr = row.tokens.split(',')
  tokenData.value = {
    length: arr.length,
    data: arr.join('\n')
  }
}
</script>
<template>
  <el-dialog v-model="logDialogVisible" title="日志" width="50%">
    <el-popconfirm title="确认删除吗?" @confirm="onMulDelete">
      <template #reference>
        <el-button
          size="small"
          type="danger"
          :disabled="selectedData.length > 0 ? false : true"
          plain
        >
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </template>
    </el-popconfirm>
    <!-- 表格区域 -->
    <el-table  table-layout="auto" v-loading="tableLoading" :data="LogTableData" @selection-change="onSelection">
      <el-table-column type="selection" label="多选框" />
      <el-table-column
        prop="time"
        label="提交时间"
        :formatter="(row) => formatTime2(row.addTime)"
      ></el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="onOpenTokenDialog(scope.row)" plain>
            <el-icon><Edit /></el-icon>
            查看
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
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        @current-change="onPageChange"
        @size-change="onPageChange"
      />
    </div>
  </el-dialog>

  <el-dialog v-model="logTokenDialogVisible" title="授权码" width="30%" center>
    <el-input
      readonly
      :value="tokenData.data"
      :autosize="{ minRows: 10, maxRows: 20 }"
      type="textarea"
      resize="none"
    />
    <el-row></el-row>
    <el-row justify="space-between">
      <el-tag type="primary">总计:{{ tokenData.length }}</el-tag>
      <el-button type="primary" size="small" plain @click="copy(tokenData.data)">复制</el-button>
    </el-row>
  </el-dialog>
</template>
<style scoped>
.el-row {
  margin-bottom: 20px;
}
.el-input {
  margin-bottom: 20px;
}
</style>
