const electron = require("electron");
const originalNet = electron.net;
const originalRequest = originalNet.request;
const fakeUrl = "https://127.0.0.1:3000";

originalNet.request = function (options, callback) {
  let url = options.url;
  if (url.startsWith("https://www.xmind.cn")) {
    url = url.replace("https://www.xmind.cn", fakeUrl);
  }
  options.url = url;
  options.rejectUnauthorized=false;
  return originalRequest.call(this, options, callback);
};

module.exports = electron;