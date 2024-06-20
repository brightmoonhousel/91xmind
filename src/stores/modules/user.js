import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userGetInfoService } from '@/api/user.js'

// 用户模块 state:token action:setToken action:removeToken
export const useUserStore = defineStore(
  'userinfo',
  () => {
    const token = ref() // 用户token
    const user = ref({}) //用户信息 {id, username, nickname, email, user_pic}
    const setToken = (newToken) => {
      token.value = newToken
    }
    const setUser = (obj) => {
      user.value = obj
    }
    const getUser = async () => {
      const res = await userGetInfoService()
      user.value = res.data
    }
    return {
      token,
      user,
      setToken,
      getUser,
      setUser
    }
  },
  {
    persist: true
  }
)
