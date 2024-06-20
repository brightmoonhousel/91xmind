import Mock from 'mockjs'
const Random = Mock.Random

let moreList = []
for (let i = 0; i < 100; i++) {
  let newObject = {
    id: i + 1,
    tokenCode: Random.string('lower', 10),
    days: 365,
    isExported: Random.boolean()
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
    time: Random.datetime(),
    data: addlog
  }
  log.push(newObject)
}

export default [
  {
    url: '/api/v1/tokenlist',
    method: 'post',
    response: ({ body }) => {
      // 每页几条
      const pageSize = body.pageSize
      // 当前页
      const currentPage = body.currentPage

      const isExported = body.isExported

      let moreList2 = [...moreList]

      if (isExported !== '') {
        moreList2 = moreList2.filter((item) => item.isExported + '' == isExported)
      }

      return {
        code: 200,
        message: '请求成功',
        data: {
          pageSize: pageSize,
          total: moreList2.length,
          list: moreList2.slice(
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
    url: '/api/v1/tokenlist',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: '删除成功',
        data: moreList.slice(0, 1)
      }
    }
  },
  {
    url: '/api/v1/tokenlog',
    method: 'post',
    response: ({ body }) => {
      // 每页几条
      const pageSize = body.pageSize
      // 当前页
      const currentPage = body.currentPage

      return {
        code: 200,
        message: '请求成功',
        data: {
          pageSize: pageSize,
          total: log.length,
          list: log.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize)
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
