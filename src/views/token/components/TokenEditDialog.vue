<template>
  <el-dialog
    @close="onResetFrom"
    v-model="editDialogVisible"
    :title="isUpdate ? '编辑授权码' : '添加授权码'"
    width="30%"
  >
    <el-form
      v-if="isUpdate"
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
        <el-button type="primary" size="small" @click="addFormModel.days = -1">永久</el-button>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onResetFrom">取消</el-button>
        <el-button type="primary" @click="onUpdateCategory(isUpdate)"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { tokenUpdateService, tokenAddService } from '@/api/token.js'
const emit = defineEmits(['onUpdateScucess'])

// 表单相关
const editFormRef = ref()
const editFormModel = ref({
  tokenCode: '',
  days: 0
})
const editFormRules = {
  tokenCode: [
    { required: true, message: '授权码不能为空', trigger: 'blur' },
    { min: 3, max: 30, message: 'Length should be 3 to 30', trigger: 'blur' }
  ],
  days: [
    { required: true, message: '天数不能为空', trigger: 'blur' },
    { type: 'number', min: -1, max: 3650, message: '请输入-1~3650的数字', trigger: 'blur' }
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
    { type: 'number', min: -1, max: 3650, message: '请输入-1~3650的数字', trigger: 'blur' }
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

const isUpdate = computed(() => editFormModel.value.id > 0)

const onUpdateCategory = async (isUpdate) => {
  isUpdate ? await editFormRef.value.validate() : await addFormRef.value.validate()
  const res = isUpdate
    ? await tokenUpdateService(editFormModel.value)
    : await tokenAddService(addFormModel.value)
  ElMessage.success(res.message)
  onResetFrom()
  emit('onUpdateScucess')
}

// 编辑和添加弹窗
const editDialogVisible = ref(false)
const onOpenEditDialog = (row) => {
  editFormModel.value = { ...row }
  editDialogVisible.value = true
}

defineExpose({
  onOpenEditDialog
})
</script>
