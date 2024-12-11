<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { userLoginService } from '@/api/user.js'
import { useUserStore } from '@/stores'
import router from '@/router'

const userStore = useUserStore()
const loading = ref(false)
// 表单
const form = ref()
const formModel = ref({
  username: '',
  password: ''
})
const rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 5, max: 10, message: '用户名必须是5-10位的字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { pattern: /^\S{6,15}$/, message: '密码必须是6-15位的字符', trigger: 'blur' }
  ]
}
// 登录函数
const login = async () => {
  try {
    if (!form.value) return
    // 先验证表单
    await form.value.validate()
    // 开始请求时设置按钮 loading 状态为 true
    loading.value = true
    // 发起登录请求
    const res = await userLoginService(formModel.value)
    // 登录成功，设置用户 token
    userStore.setToken(res.data.token)
    // 显示成功消息
    ElMessage.success(res.data.message)
    // 跳转到首页
    router.push('/')
  } catch (error) {
    // 捕获错误并显示错误消息
  } finally {
    // 无论成功或失败，请求完成后设置按钮 loading 状态为 false
    loading.value = false
  }
}
</script>

<template>
  <el-row class="login-page">
    <el-form :model="formModel" :rules="rules" ref="form" size="large" autocomplete="off">
      <div class="title">
        <h1>Login</h1>
      </div>
      <el-form-item prop="username">
        <el-input v-model="formModel.username" :prefix-icon="User" placeholder="username">
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          @keyup.enter="login"
          v-model="formModel.password"
          name="password"
          :prefix-icon="Lock"
          type="password"
          placeholder="password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button :loading="loading" @click="login" auto-insert-space>Login</el-button>
      </el-form-item>
    </el-form>
  </el-row>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background-image: linear-gradient(to right, #fbc2eb, #a6c1ee);
  display: flex;
  justify-content: center;
  align-items: center;
  .el-form {
    background-color: #fff;
    width: 358px;
    height: 400px;
    border-radius: 15px;
    padding: 0 50px;
    position: relative;
    .title {
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      line-height: 100px;
    }
    .el-button {
      width: 100%;
      margin-top: 20px;
    }
  }
}
</style>
