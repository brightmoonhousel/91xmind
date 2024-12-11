<script setup>
import LayoutAside from './components/LayoutAside.vue'
import LayoutHeader from './components/LayoutHeader.vue'
</script>

<template>
  <el-container class="layout-container">
    <Layout-Aside />
    <el-container class="vertical-container">
      <Layout-Header />
      <el-main>
        <!-- 路由页面显示 -->
        <router-view />
      </el-main>
     <!--  <Layout-Footer /> -->
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  //全局缩放
  height: 100vh;
  .vertical-container {
    display: flex; /* 设置容器为 flex 布局 */
    flex-direction: column; /* 将子元素排列方向设置为垂直方向（列） */
  }
}
</style>
