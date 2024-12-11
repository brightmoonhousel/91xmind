import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userGetInfoService } from '@/api/user.js'

export const useUserStore = defineStore(
  'userinfo',
  () => {
    const token = ref(null) // 初始值为 null
    const info = ref({ id: null, username: '' }) // 初始值为空对象

    const setToken = (newToken) => {
      token.value = newToken
    }

    const getInfo = async () => {
      const resInfo = await userGetInfoService()
      setInfo(resInfo.data)
    }

    const setInfo = (obj) => {
      info.value = { ...obj } // 使用对象解构确保不直接修改原始对象
    }

    return {
      token,
      info,
      setToken,
      setInfo,
      getInfo
    }
  },
  {
    persist: true
  }
)
