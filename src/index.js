/**js-yaml.min content... */
const _path = require("path");
const yaml = require(`./${_path.basename(__filename)}`);
const url = require("url");
const { URL } = require("url");
const crypto = require("crypto");
const http = require("http");
const https = require("https");
const fs = require("fs");
const electron = require("electron");
const { app } = require("electron");
const { exec } = require("child_process");
const console = require("console");
//取消ssl校验
app.commandLine.appendSwitch("--ignore-certificate-errors", "true");
// 设置debug模式
if (!process.argv.includes("@")) {
  console.log = function () {};
  console.error = function () {};
  console.warn = function () {};
}
//环境判断
const platform =
  {
    darwin: "darwin",
    win32: "win32",
    linux: "linux"
  }[process.platform] || "Unknown platform";
//本地Host设置
const Host = {
  name: "127.0.0.1",
  httpsPort: 8888,
  httpPort: 8080
};
//机器码hook
var DeviceCode = "";
console.info = function (...args) {
  args.forEach((a) => {
    const match = a.match(/Device ID: ([\w-]+)/);
    if (match) {
      DeviceCode = match[1];
      console.info = function () {};
    }
  });
};
/**lib */
/**utils */
/**service */
/**hook */


module.exports = { crypto, electron, https, console };
