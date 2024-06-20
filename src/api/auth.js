import request from '@/utils/request.js'

export const authPageListService = (pageInfo) => request.post('/api/v1/authlist', pageInfo)

export const authQuaryListService = (quaryData) => {
  return request.get('/api/v1/authlist', { params: quaryData })
}

export const authAddService = (authInfo) => request.post('/api/v1/authinfo', authInfo)

export const authUpdateService = (authInfo) => request.put('/api/v1/authinfo', authInfo)

export const authDeleteService = (ids) => {
  return request.delete('/api/v1/authinfo', { params: { ids } })
}
