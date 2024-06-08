//yml
//导入
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const _path = require("path");
const yaml = require(`./${_path.basename(__filename)}`);
const url = require("url");
const crypto = require("crypto");
const http = require("http");
const https = require("https");
const fs = require("fs");
const electron = require("electron");
const { app, ipcMain, session } = require("electron");
const { exec } = require("child_process");
const console = require("console");
//设置debug模式
const isDebug = process.argv.includes("@") ? true : false;
//Host
const Host = {
  name: "127.0.0.1",
  httpsPort: 8888,
  httpPort: 8080,
};
/*-------------------------------------------------*/
// 日志
if (!isDebug) {
  console.log = function () {};
  console.error = function () {};
  console.warn = function () {};
  console.info = function () {};
}
const log = {
  info: function (...args) {
    console.log(
      `\n\x1b[33m`,
      "[" + new Date().toLocaleString() + "]",
      ...args,
      `\x1b[0m\n`
    );
  },
  error: function (...args) {
    console.log(
      `\n\x1b[31m`,
      "[" + new Date().toLocaleString() + "]",
      ...args,
      `\x1b[0m\n`
    );
  },
};
/*-------------------------------------------------*/

// 自动更新
// 检查官方最新版本
const getXmindLatestVersion = () => {
  return new Promise((resolve, reject) => {
    const request = https.get(
      "https://www.xmind.cn/xmind/update/latest-win64.yml",
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          try {
            const latestInfo = yaml.load(data);
            resolve(latestInfo);
          } catch (error) {
            reject(new Error(error.message));
          }
        });
      }
    );
    request.on("error", (error) => {
      reject(error);
    });
  });
};
//检查我允许更新的最新版本
const getMyLatestVersion = () => {
  return new Promise((resolve, reject) => {
    const request = https.get("https://xmind.aifake.xyz", (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(error.message));
        }
      });
    });
    request.on("error", (error) => {
      reject(error);
    });
  });
};
//更新操作
function updateXmind() {
  switch (process.platform) {
    case "win32":
      const winAppData = process.env.APPDATA;
      if (!winAppData) {
        log.error("LOCALAPPDATA environment variable is not set.");
        return;
      }
      const updatePath = _path.join(winAppData, "Xmind", "xmindUpdate.exe");
      log.info("update path:", updatePath);
      const exists = fs.existsSync(updatePath);
      if (!exists) {
        log.error("Update executable not found.");
        return;
      }
      log.info("Begin update");
      exec(updatePath, (error) => {
        if (error) {
          log.error(`Error executing update: ${error.message}`);
        } else {
          log.info("Update executed successfully.");
        }
      });
      break; // 确保不会继续执行后续的 case
    case "darwin":
      log.info("macOS");
      break;
    case "linux":
      log.info("Linux");
      break;
    default:
      log.info("Unknown platform");
  }
}
//注册事件
app.whenReady().then(async () => {
  log.info("check update...");
  try {
    const nowVersion = app.getVersion();
    const xmindLatestVersion = await getXmindLatestVersion();
    if (xmindLatestVersion.version > nowVersion) {
      log.info(
        `New version ${xmindLatestVersion.version} is available. send to update.`
      );
      const myLatestVersion = await getMyLatestVersion();
      log.info(`my latest version ${myLatestVersion.version}`);
      if (xmindLatestVersion.version <= myLatestVersion.version) {
        log.info("allow update ");
        app.once("before-quit", () => {
          updateXmind();
        });
      } else {
        log.info("disallow update");
      }
    } else {
      log.info(`Current version ${nowVersion} is the latest.`);
    }
  } catch (error) {
    log.error("check update error:", error);
  }
});
/*-------------------------------------------------*/
//服务器框架
// 定义一个空数组来存储中间件
const middlewares = [];
const routes = {
  GET: {},
  POST: {},
  HEAD: {},
};
var proxyTargets = "";
class FuckerServer {
  // 添加中间件
  use(middleware) {
    middlewares.push(middleware);
  }
  get(path, handler) {
    routes.GET[path] = handler;
  }
  head(path, handler) {
    routes.HEAD[path] = handler;
  }

  post(path, handler) {
    routes.POST[path] = handler;
  }

  proxy(target) {
    proxyTargets = target;
  }

  // 启动服务器
  start(port, host, options) {
    // 创建 HTTPS 服务器
    const httpOrhttps = options ? https : http;
    const server = httpOrhttps.createServer(options, (req, res) => {
      const parsedUrl = url.parse(req.url, true);
      // 获取请求路径
      const path = parsedUrl.pathname;
      // 获取请求方法
      const method = req.method;
      // 将查询参数保存在 req.query 中
      req.query = parsedUrl.query;
      // 调用中间件
      for (const middleware of middlewares) {
        middleware(req, res);
      }
      // 处理路由
      if (method === "GET" && routes.GET[path]) {
        this.handleResponse(req, res, routes.GET[path](req, res));
      } else if (method === "POST" && routes.POST[path]) {
        this.handleResponse(req, res, routes.POST[path](req, res));
      } else if (method === "HEAD" && routes.HEAD[path]) {
        this.handleResponse(req, res, routes.HEAD[path](req, res));
      } else if (proxyTargets) {
        log.info(`[Proxy][${req.url}]`);

        // 处理代理请求
        req.headers.host = proxyTargets;
        const options = {
          hostname: proxyTargets,
          protocol: "https:",
          path: parsedUrl.path,
          method: method,
          headers: req.headers,
        };
        const proxyReq = https.request(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        });
        req.pipe(proxyReq, { end: true });
        proxyReq.on("error", (err) => {
          log.error("[proxy error]:", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Proxy error");
        });
        // log.info(`[Proxy][${req.url}]`);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
      }
    });
    server.listen(port, host, () => {
      log.info(
        `server start success ${options ? "https" : "http"}://${host}:${port}`
      );
    });
  }
  // 处理路由函数返回的内容
  handleResponse(req, res, response) {
    log.info(`[${req.method}][${req.url}]`);
    if (response) {
      if (typeof response === "string" || Buffer.isBuffer(response)) {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(response);
      } else if (typeof response === "object") {
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
        });
        res.end(JSON.stringify(response));
      } else {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(response.toString());
      }
    }
  }
}
/*-------------------------------------------------*/
//crypto hook
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
//electron hook
//取消ssl校验
electron.app.commandLine.appendSwitch("--ignore-certificate-errors", "true");
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
//https hook
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

module.exports = { log, crypto, electron, https, Host, FuckerServer, console };
