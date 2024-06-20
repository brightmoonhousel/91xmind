import axios from 'axios'
import { useUserStore } from '../stores'
import router from '../router'

// 1. 配置一个axios实例，比如基础地址、超时时间、头部
// const baseURL = 'http://big-event-vue-api-t.itheima.net'
const baseURL = ''
const instance = axios.create({
  baseURL,
  timeout: 10000
})

// 2. 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从store仓库中导入token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    return config
  },
  // 处理请求错误
  (err) => Promise.reject(err) // Promise.reject 接收一个参数创建一个promise对象，这个参数表示拒绝的原因，创建的 Promise 对象将立即变为拒绝状态（rejected）。
)

// 3. 添加响应拦截器
instance.interceptors.response.use(
  // 处理响应成功
  (res) => {
    // 业务成功
    if (res.data.code === 200) {
      console.log('成功通过响应拦截器！')
      return res.data
    }
    // 业务失败
    ElMessage.error(res.data.message || '服务异常！')
    return Promise.reject(res.data) // Promise.reject 是 JavaScript 中的一个方法，它用于创建一个被拒绝（rejected）的 Promise 对象。这在处理异步操作时非常有用，特别是在需要表示一个操作失败或出错时。
  },
  // 处理响应失败
  (err) => {
    // 处理401错误 —— 权限不足 or token过期 => 拦截到登录
    if (err.response.status === 401) {
      router.push('/login')
    }
    // 处理默认情况的错误
    ElMessage.error(err.response.message || '服务异常！')
    return Promise.reject(err)
  }
)
// 导出
export default instance
export { baseURL }

// request.js 文件很可能封装了 Axios 或类似的 HTTP 客户端库，用于发送 HTTP 请求。这种封装通常包括预设的配置，例如基础 URL、请求头、超时时间等。
