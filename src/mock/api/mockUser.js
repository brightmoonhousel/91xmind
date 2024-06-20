export default [
  {
    url: '/api/v1/login',
    method: 'post',
    response: ({ body }) => {
      if (body.username == 'admin' && body.password == '123456') {
        return {
          code: 200,
          message: '登录成功',
          token: 'mock-token'
        }
      } else {
        return {
          code: 401,
          message: '用户名或密码错误'
        }
      }
    }
  },
  {
    url: '/api/v1/userinfo',
    method: 'get',
    response: ({ headers }) => {
      const token = headers['authorization']
      if (token === 'mock-token') {
        return {
          code: 200,
          message: '请求成功',
          data: {
            id: '1',
            username: 'fuc'
          }
        }
      } else {
        return {
          code: 401,
          message: '未授权'
        }
      }
    }
  },
  {
    url: '/api/v1/userinfo',
    method: 'patch',
    response: ({ body }) => {
      return {
        code: 200,
        message: '修改成功',
        data: body
      }
    }
  }
]
