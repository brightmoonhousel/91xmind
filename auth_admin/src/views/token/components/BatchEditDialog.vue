<template>
  <!-- 批量操作 -->
  <el-dialog
    v-model="batchDialogVisible"
    width="15%"
    title="批量操作"
    center
    :modal="false"
    append-to-body="true"
  >
    <p>请选择要进行的操作：</p>
    <div>
      <el-popconfirm title="确认删除吗?" @confirm="onMulDelete(), (batchDialogVisible = false)">
        <template #reference>
          <el-button type="danger" plain>
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </template>
      </el-popconfirm>
      <el-button type="primary" plain @click="onOpenTokenDialog(selectedData)">
        <el-icon><Download /></el-icon>导出
      </el-button>
    </div>
  </el-dialog>
  <!-- 导出显示 -->
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

<script setup>
import { Delete, Download } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { tokenDeleteService } from '@/api/token.js'
const emit = defineEmits(['onMulDeleteScucess'])
import useClipboard from 'vue-clipboard3'
const { toClipboard } = useClipboard()
const copy = async (msg) => {
  try {
    await toClipboard(msg)
    ElMessage.success('复制成功')
  } catch (e) {
    // 复制失败
  }
}
const selectedData = ref([])
const batchDialogVisible = ref(false)
const openBatchDialog = (data) => {
  selectedData.value = [...data]
  batchDialogVisible.value = true
}

const onMulDelete = async () => {
  if (selectedData.value.length === 0) {
    ElMessage.warning('请选择要删除的授权')
    return
  }
  const delIds = selectedData.value.map((item) => item.id)
  const res = await tokenDeleteService(delIds.join(','))
  ElMessage.success(res.data.message)
  emit('onMulDeleteScucess')
  selectedData.value = []
}

//token文本列表弹窗
const logTokenDialogVisible = ref(false)
const tokenData = ref({})
const onOpenTokenDialog = (selectedData) => {
  const array = selectedData.map((item) => item.tokenCode)
  tokenData.value = {
    length: array.length,
    data: array.join('\n')
  }
  logTokenDialogVisible.value = true
}

defineExpose({ openBatchDialog })
</script>
