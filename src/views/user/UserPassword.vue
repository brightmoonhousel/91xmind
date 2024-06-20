<script setup>
import { ref } from 'vue'
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'
import 'element-plus/dist/index.css'
import { userUpdatePassword } from '@/api/user.js'
import { useUserStore } from '@/stores/modules/user'
import router from '@/router'

const userStore = useUserStore()
const formRef = ref(null)
const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 15, message: '原密码长度应为 6-15 位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 15, message: '新密码长度应为 6-15 位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === form.value.oldPassword) {
          return callback(new Error('新密码不能与原密码相同'))
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { min: 6, max: 15, message: '确认密码长度应为 6-15 位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.newPassword) {
          return callback(new Error('两次输入的密码不一致'))
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      // 发送更新请求到服务器
      const res = await userUpdatePassword(form.value)
      ElMessage.success(res.message)
      userStore.setToken('')
      userStore.setUser({})
      router.push('/login')
      // 实际操作中，这里应该是发送请求到服务器的代码
    } else {
      ElMessage.error('表单验证失败')
      return false
    }
  })
}

const resetForm = () => {
  formRef.value.resetFields()
}
</script>

<template>
  <page-container title="重置密码">
    <template #default>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="form.oldPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="form.newPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">修改密码</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </template>
  </page-container>
</template>

<style scoped lang="scss">
.el-form-item {
  margin-bottom: 24px; // 增加表单项之间的间隔

  .el-input {
    width: 250px; // 缩短输入框的宽度
  }
}

.form-buttons {
  display: flex;
  align-items: center;
  margin-left: 100px; // 将按钮组移动到与输入框对齐的位置

  .el-button {
    margin-right: 10px; // 在按钮之间添加一些间隔
  }
}
</style>
