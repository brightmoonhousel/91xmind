const axios = require("axios");
const {baseURL} = require('../config');
const m_request = axios.create({
  baseURL: baseURL,
  timeout: 3000
});

// 添加响应拦截器
m_request.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return {
      status: 400,
      message: "server error",
      data: { code: 400, events: [], _code: 400 },
      error: error
    };
  }
);

module.exports = m_request;
