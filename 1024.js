//hook模块
const Host = {
  name: "127.0.0.1",
  httpsPort: 3000,
  httpPort: 3001,
};
/*-------------------------------------------------*/
//设置debug模式
const isDebug = true;
const log = {
  info: function (...args) {
    if (isDebug)
      console.log(`\n\x1b[32m`,
        "[" + new Date().toLocaleString() + "]",
        ...args,
        `\x1b[0m\n`
      );
  },
  error: function (...args) {
    console.log(`\n\x1b[31m`,
        "[" + new Date().toLocaleString() + "]",
        ...args,
        `\x1b[0m\n`
      );
  },
};
/*-------------------------------------------------*/
//crypto
const crypto = require("crypto");
const originalPublicDecrypt = crypto.publicDecrypt;
crypto.publicDecrypt = function (options, buffer) {
  try {
    options.key = `-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDELel8VBfyRQowc9b1Lfi4LMjB\n7i0w9cvWMWJQesLcrEoIKwVvgp4tX4zQ97BmnoC5lGDrBLPC/EgcXjmz2Vu/94FQ\n0VaLjAhnJeyinaW5wNZrKm391eb6fjnX7/cjOe8/pb8HklmPfsshgTpw/PE1gJ6b\ncg7UybMtyPn2pTuCrQIDAQAB\n-----END PUBLIC KEY-----`;
    return originalPublicDecrypt.call(this, options, buffer);
  } catch (e) {
    return originalPublicDecrypt.call(this, options, buffer);
  }
};
/*-------------------------------------------------*/
//electron
const electron = require("electron");
const originalElectronRequest = electron.net.request;
const fakeUrl = `https://${Host.name}:${Host.httpsPort}`;
electron.net.request = function (options, callback) {
  let url = options.url;
  if (url.startsWith("https://www.xmind.cn")) {
    url = url.replace("https://www.xmind.cn", fakeUrl);
  }
  options.url = url;
  options.rejectUnauthorized = false;
  return originalElectronRequest.call(this, options, callback);
};
/*-------------------------------------------------*/
//https
const https = require("https");
const originalHttpsRequest = https.request;
https.request = function (options, callback) {
  if (options.pathname == "/xmind/update/latest-win64.yml") {
    options = {
      protocol: "https:",
      host: Host.name,
      port: Host.httpsPort,
      hostname: Host.name,
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
  return originalHttpsRequest.call(this, options, callback);
};
/*-------------------------------------------------*/

const events = require("events");
const originalEmit = events.EventEmitter.prototype.emit;

events.EventEmitter.prototype.emit = function (event, ...args) {
  if (String(event).startsWith("status")) {
    log.info(`Event '${event}' has been emitted `, args);
  }

  const result = originalEmit.apply(this, arguments);
  return result;
};
/*-------------------------------------------------*/

module.exports = { log, crypto, electron, https, Host, events };
