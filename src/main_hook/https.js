const { URL } = require("url");
const https = require("https");
const { platform, hostInfo } = require("../config");

const originalHttpsRequest = https.request;

//已失效 官方不通过此地址获取更新信息
https.request = (urlOrOptions, optionsOrCallback, callback) => {
  let url, options, cb;
  if (typeof urlOrOptions === "string" || urlOrOptions instanceof URL) {
    url = urlOrOptions;
    options = optionsOrCallback;
    cb = callback;
  } else {
    options = urlOrOptions;
    cb = optionsOrCallback;
  }
  if (
    options?.pathname == "/xmind/update/latest-win64.yml" ||
    options?.pathname == "/xmind/update/latest-mac.json"
  ) {
    const updateUrl = {
      darwin: "/xmind/update/latest-mac.json",
      win32: "/xmind/update/latest-win64.yml",
      linux: "linux"
    }[platform];
    options = {
      protocol: "https:",
      host: hostInfo.name,
      port: hostInfo.httpsPort,
      hostname: hostInfo.name,
      path: updateUrl,
      method: "GET",
      headers: {
        Accept: "*/*",
        "User-Agent": "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)",
        "Accept-Encoding": "gzip,deflate",
        Connection: "close"
      },
      rejectUnauthorized: false // 忽略证书验证
    };
  }
  return originalHttpsRequest.call(
    this,
    ...(url ? [url, options] : [options]),
    cb
  );
};
module.exports = https;
