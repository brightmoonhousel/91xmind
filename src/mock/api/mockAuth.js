import Mock from 'mockjs'
const Random = Mock.Random

let moreList = []
for (let i = 0; i < 10000; i++) {
  let newObject = {
    id: i + 1,
    deviceCode: Random.string('lower', 10),
    tokenCode: Random.string('lower', 10),
    usedTime: 1548381600000,
    expiryTime: 1548381600000,
    isBanned: Random.boolean()
  }
  moreList.push(newObject)
}

export default [
  {
    url: '/api/v1/authinfo',
    method: 'get',
    response: ({ query }) => {
      if (query.tokenCode||query.deviceCode) {
        return {
          query:query,
          code: 200,
          message: '请求成功',
          data: moreList.slice(0, 1)
        }
      }
      //总共多少条
      const total = moreList.length
      // 每页几条
      const pageSize = query.pageSize
      // 当前页
      const currentPage = query.currentPage
      return {
        code: 200,
        message: '请求成功',
        data: {

          total: total,
          rows: moreList.slice(
            (currentPage - 1) * pageSize,
            (currentPage - 1) * pageSize + pageSize
          )
        }
      }
    }
  },
  {
    url: '/api/v1/authinfo',
    method: 'post',
    response: ({ body }) => {
      return {
        code: 200,
        message: '添加成功',
        data: body
      }
    }
  },
  {
    url: '/api/v1/authinfo',
    method: 'put',
    response: ({ body }) => {
      return {
        code: 200,
        message: '更新成功',
        data: body
      }
    }
  },
  {
    url: '/api/v1/authinfo',
    method: 'delete',
    response: ({ query }) => {
      return {
        code: 200,
        message: '删除成功',
        data: query
      }
    }
  }
]
