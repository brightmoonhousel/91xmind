import { dayjs } from 'element-plus'

export const formatTime = (time) => dayjs(time).format('YYYY-MM-DD')
export const formatTime2 = (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
