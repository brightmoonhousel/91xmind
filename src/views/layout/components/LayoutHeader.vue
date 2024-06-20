<script setup>
import { EditPen, SwitchButton, CaretBottom } from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/default.png'
import { useUserStore } from '@/stores'
import { onMounted } from 'vue'
import router from '@/router'

const userStore = useUserStore()

onMounted(() => userStore.getUser())

const handleCommand = async (key) => {
  if (key === 'logout') {
    await ElMessageBox.confirm('你确认要退出登录吗？', '温馨提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.setUser({})
    userStore.setToken('')
    router.push(`/login`)
  } else {
    router.push(`/user/${key}`)
  }
}
</script>

<template>
  <el-header>
    <div>
      当前用户：<strong>{{ userStore.user.username || '读取失败' }}</strong>
    </div>
    <!-- 展示给用户看的部分 -->
    <el-dropdown placement="bottom-end" @command="handleCommand">
      <span class="el-dropdown__box">
        <el-avatar :src="defaultAvatar" />
        <el-icon><CaretBottom /></el-icon>
      </span>
      <!-- 真正折叠内容在下面 -->
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="password" :icon="EditPen">重置密码</el-dropdown-item>
          <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-header>
</template>
<style lang="scss" scoped>
.el-header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .el-dropdown__box {
    display: flex;
    align-items: center;
    .el-icon {
      color: #999;
      margin-left: 10px;
    }

    &:active,
    &:focus {
      outline: none;
    }
  }
}
</style>
