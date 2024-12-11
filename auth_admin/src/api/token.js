import request from '@/utils/request.js'

export const tokenPageListService = ({ pageSize, currentPage }) =>
  request.get('/api/v1/tokeninfo', { params: { pageSize, currentPage } })

export const tokenQuaryListService = ({ tokenCode }) =>
  request.get('/api/v1/tokeninfo', { params: { tokenCode } })

export const tokenAddService = ({ count, days }) =>
  request.post('/api/v1/tokeninfo', { count, days })

export const tokenUpdateService = ({ id, tokenCode, days }) =>
  request.put('/api/v1/tokeninfo', { id, tokenCode, days })

export const tokenDeleteService = (ids) => request.delete('/api/v1/tokeninfo', { params: { ids } })

export const logDeleteService = (ids) => request.delete('/api/v1/tokenlog', { params: { ids } })

export const logPageListService = ({ pageSize, currentPage }) =>
  request.get('/api/v1/tokenlog', { params: { pageSize, currentPage } })
