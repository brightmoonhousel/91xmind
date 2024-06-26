import request from '@/utils/request.js'

export const userLoginService = ({username,password}) => request.post('/api/login', {username,password})

export const userGetInfoService = () => request.get('/api/v1/userinfo')

export const userUpdatePassword = ({ oldPassword, newPassword, confirmPassword }) =>
  request.patch('/api/v1/userinfo', {
    old_pwd: oldPassword,
    new_pwd: newPassword,
    re_pwd: confirmPassword
  })
