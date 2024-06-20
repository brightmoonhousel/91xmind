<script setup>
import { ref } from 'vue'
import { authAddService, authUpdateService } from '@/api/auth.js'

const formModel = ref({})

//弹窗相关
const dialogVisible = ref(false)
const open = (row) => {
  dialogVisible.value = true
  formModel.value = { ...row }
}
//表单相关
const ruleFormRef = ref()

const rules = {
  deviceCode: [
    { required: true, message: '设备码不能为空', trigger: 'blur' },
    { min: 3, max: 30, message: 'Length should be 3 to 30', trigger: 'blur' }
  ],
  authCode: [
    { required: true, message: '授权码不能为空', trigger: 'blur' },
    { min: 3, max: 30, message: 'Length should be 3 to 30', trigger: 'blur' }
  ],
  expiryTime: [{ required: true, message: '到期时间不能为空', trigger: 'blur' }]
}

const onResetFrom = () => {
  if (!ruleFormRef.value) {
    return
  }
  dialogVisible.value = false
  ruleFormRef.value.clearValidate()
}

//add
const onAddCategory = async () => {
  await ruleFormRef.value.validate()
  const res = await authAddService(formModel.value)
  ElMessage.success(res.message)
  emit('success')
  onResetFrom()
}
// update
const onUpdateCategory = async () => {
  await ruleFormRef.value.validate()
  const res = await authUpdateService(formModel.value)
  ElMessage.success(res.message)
  emit('success')
  onResetFrom()
}

const emit = defineEmits(['success'])
// 暴露
defineExpose({
  open
})
</script>
<template>
  <el-dialog
    @close="onResetFrom"
    v-model="dialogVisible"
    :title="formModel.id ? '编辑授权' : '添加授权'"
    width="30%"
  >
    <el-form
      ref="ruleFormRef"
      :model="formModel"
      :rules="rules"
      label-width="100px"
      style="padding-right: 30px"
    >
      <el-form-item label="设备码" prop="deviceCode">
        <el-input v-model="formModel.deviceCode" placeholder="请输入设备码"></el-input>
      </el-form-item>
      <el-form-item label="授权码" prop="authCode">
        <el-input v-model="formModel.authCode" placeholder="请输入授权码"></el-input>
      </el-form-item>
      <el-form-item label="有效期" prop="expiryTime">
        <el-date-picker
          v-model="formModel.expiryTime"
          type="date"
          placeholder="请选择到期时间"
          :size="size"
        />
      </el-form-item>
      <el-form-item label="是否封禁" prop="isBanned">
        <el-switch v-model="formModel.isBanned" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onResetFrom">取消</el-button>
        <el-button type="primary" @click="formModel.id ? onUpdateCategory() : onAddCategory()">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
