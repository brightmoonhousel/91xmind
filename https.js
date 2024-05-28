const https = require("https");
// 存储原始的 https.request 函数
const originalHttpsRequest = https.request;
// 修改 https.request 函数
https.request = function (options, callback) {
  if (options.path.startsWith("/xmind/update")) {
    options = {
      protocol: "https:",
      host: "127.0.0.1",
      port: 3000,
      hostname: "127.0.0.1",
      path: "/xmind/update/latest-win64.yml",
      method: "GET",
      headers: {
        Accept: "*/*",
        "User-Agent": "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)",
        "Accept-Encoding": "gzip,deflate",
        Connection: "close",
      },
      rejectUnauthorized: false, // 忽略证书验证
    };
  } 
  const req = originalHttpsRequest.call(this, options, callback);
  // 返回修改后的请求对象
  return req;
};

// 导出修改后的 https
module.exports = https;
