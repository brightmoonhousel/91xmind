<script setup>
import { ref, onMounted } from 'vue'
import { Delete, Edit } from '@element-plus/icons-vue'
import { formatTime } from '@/utils/format.js'
import { authPageListService, authDeleteService, authQuaryListService } from '@/api/auth.js'
import AuthDialog from './components/AuthDialog.vue'
//表格数据
const authCodeTableData = ref([])
//查询数据
const queryData = ref({
  deviceCode: '',
  authCode: ''
})
//表格加载
const tableLoading = ref(true)
//分页数据
const page = ref({
  total: 0,
  pageSize: 10,
  currentPage: 1
})
//子组件实例
const subDialog = ref()

//多选数据
const selectedData = ref([])

//查询操作
const onQueryData = async () => {
  if (!queryData.value.deviceCode && !queryData.value.authCode) {
    return
  }

  const sendQueryData = (({ deviceCode, authCode }) => {
    const result = {}
    if (deviceCode !== '') {
      result.deviceCode = deviceCode
    }
    if (authCode !== '') {
      result.authCode = authCode
    }
    return result
  })(queryData.value)

  const res = await authQuaryListService(sendQueryData)
  authCodeTableData.value = res.data
}
//重置查询
const onResetData = () => {
  queryData.value = {
    deviceCode: '',
    authCode: ''
  }
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
  const res = await authDeleteService(delIds.join(','))
  ElMessage.success(res.message)
  onPageChange()
  selectedData.value = []
}
//单删
const onDelete = async (row) => {
  const res = await authDeleteService(row.id)
  ElMessage.success(res.message)
  onPageChange()
}
//编辑
const onOpenDialog = (row) => {
  console.log(row)
  subDialog.value.open(row)
}
//分页变化
const onPageChange = async () => {
  tableLoading.value = true
  const res = await authPageListService(page.value)
  authCodeTableData.value = res.data.list
  page.value.total = res.data.total
  setTimeout(() => {
    tableLoading.value = false
  }, 300)
}

//初始化
onMounted(async () => {
  //初始化表格数据
  tableLoading.value = true
  const res = await authPageListService(page.value)
  authCodeTableData.value = res.data.list
  page.value.total = res.data.total
  setTimeout(() => {
    tableLoading.value = false
  }, 300)
})
</script>

<template>
  <page-container title="用户管理">
    <template #extra>
      <el-button type="primary" @click="onOpenDialog" plain>
        <el-icon><Edit /></el-icon>添加授权
      </el-button>
      <el-popconfirm title="确认删除吗?" @confirm="onMulDelete">
        <template #reference>
          <el-button type="danger" :disabled="selectedData.length > 0 ? false : true" plain>
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
        </template>
      </el-popconfirm>
    </template>
    <!-- 查询 -->
    <el-row gutter="20">
      <el-col :span="3">
        <div>
          <el-input v-model="queryData.deviceCode" placeholder="请输入设备码"></el-input>
        </div>
      </el-col>
      <el-col :span="3">
        <div>
          <el-input v-model="queryData.authCode" placeholder="请输入授权码"></el-input>
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
      :data="authCodeTableData"
      style="width: 100%"
      @selection-change="onSelection"
    >
      <el-table-column type="selection" label="多选框" />
      <el-table-column label="id" prop="id" width="80" />
      <el-table-column label="设备码" prop="deviceCode" />
      <el-table-column label="授权码" prop="authCode" />
      <el-table-column
        label="激活日期"
        prop="usedTime"
        :formatter="(row) => formatTime(row.usedTime)"
      />
      <el-table-column
        label="到期时间"
        prop="expiryTime"
        :formatter="(row) => formatTime(row.expiryTime)"
      />
      <el-table-column label="使用状态" prop="isBanned">
        <template #default="scope">
          <span :class="['status', scope.row.isBanned ? 'banned' : 'normal']">
            {{ scope.row.isBanned ? '封禁' : '正常' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="onOpenDialog(scope.row)" plain>
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
  <Auth-Dialog ref="subDialog" @success="onPageChange" />
</template>
<style scoped>
.normal {
  color: green; /* 正常显示为绿色 */
}
.banned {
  color: red; /* 封禁显示为红色 */
}
</style>
