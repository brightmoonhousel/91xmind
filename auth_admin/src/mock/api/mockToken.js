import Mock from 'mockjs'
const Random = Mock.Random

let moreList = []
for (let i = 0; i < 100; i++) {
  let newObject = {
    id: i + 1,
    tokenCode: Random.string('lower', 10),
    days: 365
  }
  moreList.push(newObject)
}

let addlog = []
for (let i = 0; i < 10; i++) {
  addlog.push(Random.string('lower', 10))
}

let log = []
for (let i = 0; i < 15; i++) {
  let newObject = {
    id: i + 1,
    time: 1548381600000,
    data: addlog.join('\n')
  }
  log.push(newObject)
}

export default [
  {
    url: '/api/v1/tokeninfo',
    method: 'get',
    response: ({ query }) => {
      if (query.tokenCode) {
        return {
        
          code: 200,
          message: '请求成功',
          data: moreList.slice(0, 1)
        }
      }
      // 每页几条
      const pageSize = query.pageSize
      // 当前页
      const currentPage = query.currentPage

      return {
        code: 200,
        message: '请求成功',
        query:query,
        data: {
          total: moreList.length,
          rows: moreList.slice(
            (currentPage - 1) * pageSize,
            (currentPage - 1) * pageSize + pageSize
          )
        }
      }
    }
  },
  {
    url: '/api/v1/tokeninfo',
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
    url: '/api/v1/tokeninfo',
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
    url: '/api/v1/tokeninfo',
    method: 'delete',
    response: ({ query }) => {
      return {
        code: 200,
        message: '删除成功',
        data: query
      }
    }
  },
  {
    url: '/api/v1/tokeninfo',
    method: 'patch',
    response: ({ body }) => {
      return {
        code: 200,
        message: '导出成功',
        data: body
      }
    }
  },
  {
    url: '/api/v1/tokenlog',
    method: 'get',
    response: ({ query }) => {
      // 每页几条
      const pageSize = query.pageSize
      // 当前页
      const currentPage = query.currentPage

      return {
        code: 200,
        message: '请求成功',
        data: {
          pageSize: pageSize,
          total: log.length,
          rows: log.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize)
        }
      }
    }
  },
  {
    url: '/api/v1/tokenlog',
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
