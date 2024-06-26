const axios = require("axios");
const m_request = axios.create({
  baseURL: "http://127.0.0.1:8787",
  timeout: 3000,
});

// 添加响应拦截器
m_request.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return {
      status: 500,
      message: "server error"
    };
  }
);

module.exports = m_request;
