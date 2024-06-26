import axios from 'axios'
import { useUserStore } from '../stores'
import debounce from 'lodash/debounce'
import router from '../router'

// 使用 lodash 的 debounce 来防抖处理请求
const debouncedRequest = debounce((config, resolve) => {
  resolve(config)
}, 300) // 300ms 防抖时间，可以根据需要调整

const baseURL = import.meta.env.VITE_REQUEST_BASE_URL
const instance = axios.create({
  baseURL,
  timeout: 10000
})

// 定义排除防抖的 URL
const excludedUrls = [
  '/api/v1/userinfo'
]

// 请求拦截器
instance.interceptors.request.use(
  (config) =>
    new Promise((resolve) => {
      console.log('请求拦截器：', config.url)
      const userStore = useUserStore()
      if (userStore.token) {
        config.headers.Authorization = userStore.token
      }
      // 检查是否需要排除该 URL
      if (excludedUrls.includes(config.url)) {
        resolve(config) // 如果是排除的 URL，则直接 resolve(config)，不进行防抖处理
      } else {
        debouncedRequest(config, resolve) // 否则进行防抖处理
      }
    }),
  (err) => Promise.reject(err)
)
// 3. 添加响应拦截器
instance.interceptors.response.use(
  // 处理响应成功
  (res) => {
    // 业务成功
    if (res.data.code === 200) {
      return res.data
    }
    ElMessage.error(res.data.message || res.data.data.message || '服务异常！')
    return Promise.reject(res.data) // Promise.reject 是 JavaScript 中的一个方法，它用于创建一个被拒绝（rejected）的 Promise 对象。这在处理异步操作时非常有用，特别是在需要表示一个操作失败或出错时。
  },
  // 处理响应失败
  (err) => {
    // 处理401错误 —— 权限不足 or token过期 => 拦截到登录
    if (err.response.status === 401) {
      ElMessage.error('登录过期，请重新登录！')
      router.push('/login')
      return Promise.reject(err)
    }
    // 处理默认情况的错误
    ElMessage.error(err.response.message || err.response.data.message || '服务异常！')
    return Promise.reject(err)
  }
)
// 导出
export default instance
export { baseURL }

// request.js 文件很可能封装了 Axios 或类似的 HTTP 客户端库，用于发送 HTTP 请求。这种封装通常包括预设的配置，例如基础 URL、请求头、超时时间等。
