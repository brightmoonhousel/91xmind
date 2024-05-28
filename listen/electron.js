const electron = require("electron");
const {log} = require("../listen");
// 获取原始的 net 模块
const originalNet = electron.net;

// 保存原始的 request 函数
const originalRequest = originalNet.request;

// 定义要不需要替换的路径列表
const pathsToExclude = [
  "/_api/share/vana_map/?lang=zh",
  "/_api/share/maps",
  "/_api/order/",
  "/_api/v3/order",
  "/_api/profile",
  "/_res/get-vana-price",
  "_res/templates/"
];

// 修改 request 函数
Object.defineProperty(originalNet, "request", {
  get() {
    return function (options, callback) {
      let url = options["url"];
      // 使用正则表达式来匹配路径
      let shouldReplace = !pathsToExclude.some((path) =>
        new RegExp(path).test(url)
      );
      // options.headers["Authorization"] = "Bearer YOUR_TOKEN";
      url = shouldReplace
        ? url.replace("https://www.xmind.cn", "http://127.0.0.1:3000")
        : url;
      options["url"] = url;
      // console.error(
      //   "===== Intercepting net.request with options:",
      //   options,
      //   callback
      // );
      const req = originalRequest(options, callback);

      // // 注册 response 事件监听器
      // req.on("response", (response) => {
      //   let data = "";
      //   response.on(
      //     "data",
      //     function (chunk) {
      //       data += chunk;
      //       chunk = "FUCKING data";
      //       this.emit("continue", chunk);
      //     }.bind(response)
      //   );
      //   response.on(
      //     "end",
      //     function () {
      //       // 将数据添加到缓存
      //       // cache[options.url] = data;
      //       log(
      //         "\nIntercepting net.request with options:",
      //         options,
      //         "\nResponse: ",
      //         data
      //       );
      //       this.emit("continue");
      //     }.bind(response)
      //   );
      // });
      return req;
    };
    // return function (options, ...args) {
    //   // 对 options 进行修改或者添加自己的逻辑
    //   console.error("===== Intercepting net.request with options:", options);

    //   // { url: 'https://www.xmind.cn/_res/user_sub_status', method: 'GET' }
    //   // { url: 'https://www.xmind.cn/_res/devices', method: 'POST' }

    //   // 调用原始的 request 函数
    //   return originalRequest.call(this, options, ...args);
    // };
  },
});

module.exports = electron;
