<script setup>
import { Management, UserFilled, EditPen, Ticket } from '@element-plus/icons-vue'
</script>
<template>
  <el-aside width="200px">
    <div class="el-aside__logo"></div>
    <!-- 菜单组件 
        :default-active="$route.path" 当前路由高亮
        router开启之后 el-menu-item的index就是跳转的路径 相当于to
      -->
    <el-menu
      active-text-color="#ffd04b"
      background-color="#232323"
      :default-active="$route.path"
      text-color="#fff"
      router
    >
      <el-menu-item index="/auth/manage">
        <el-icon><Management /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
      <el-menu-item index="/key/manage">
        <el-icon><Ticket /></el-icon>
        <span>授权码管理</span>
      </el-menu-item>
      <!-- 多级菜单 -->
      <el-sub-menu index="/user">
        <!-- 多级菜单标题 具名插槽 -->
        <template #title>
          <el-icon><UserFilled /></el-icon>
          <span>个人中心</span>
        </template>
        <!-- 下面是多级菜单展开内容 默认插槽配置-->
        <el-menu-item index="/user/password">
          <el-icon><EditPen /></el-icon>
          <span>重置密码</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>
<style lang="scss">
.el-aside {
  background-color: #232323;
  &__logo {
    height: 120px;
    // weight: 250px;
    background: url('@/assets/logo.png') no-repeat center / 120px auto;
    // background: url('@/assets/1.jpg') no-repeat center / 120px auto;
  }
  .el-menu {
    border-right: none;
  }
}
</style>
