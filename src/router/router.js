import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/modules/user.js'
// 创建路由实例
// .meta.env.BASE_URL vite中的环境变量 vite.config.js中的base配置项
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', component: () => import('../views/login/LoginPage.vue') }, // 异步组件写法
    {
      path: '/',
      component: () => import('../views/layout/LayoutContainer.vue'),
      redirect: '/auth/manage',
      children: [
        {
          path: '/auth/manage',
          component: () => import('../views/auth/AuthManage.vue')
        },
        {
          path: '/key/manage',
          component: () => import('../views/token/TokenManage.vue')
        },
        {
          path: '/user/password',
          component: () => import('../views/user/UserPassword.vue')
        }
      ]
    }
  ]
})

// 登录访问拦截
// 对于各种返回值：
// true：不拦截 false：拦截 一个地址：回到此地址
router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!userStore.token && to.path !== '/login') {
    return '/login'
  }
  return true
})
