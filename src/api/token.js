import request from '@/utils/request.js'

export const tokenPageListService = (pageInfo) => {
  console.log(pageInfo)
  return request.post('/api/v1/tokenlist', pageInfo)
}
export const tokenQuaryListService = (quaryData) => {
  console.log(quaryData)
  return request.get('/api/v1/tokenlist', { params: { quaryData } })
}
export const tokenAddService = (tokenInfo) => request.post('/api/v1/tokeninfo', tokenInfo)

export const tokenUpdateService = (tokenInfo) => request.put('/api/v1/tokeninfo', tokenInfo)
export const tokenUpdateExportedService = (tokenInfo) =>
  request.patch('/api/v1/tokeninfo', tokenInfo)

export const tokenDeleteService = (ids) => {
  return request.delete('/api/v1/tokeninfo', { params: { ids } })
}

export const logPageListService = (pageInfo) => {
  return request.post('/api/v1/tokenlog', pageInfo)
}

export const logDeleteService = (ids) => {
  return request.delete('/api/v1/tokenlog', { params: { ids } })
}
