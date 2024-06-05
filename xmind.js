//yml

//导入
const _path = require("path");
const yaml = require(`./${_path.basename(__filename)}`);
const url = require("url");
const crypto = require("crypto");
const http = require("http");
const https = require("https");
const fs = require("fs");
const electron = require("electron");
const { app } = require("electron");
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
log.info("hook.js is running...", process.argv);
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
        if (path.startsWith("/xmind/update")) {
          log.info(`[Proxy][${req.url}]`);
        }
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
/*-------------------------------------------------*/

// const events = require("events");
// const originalEmit = events.EventEmitter.prototype.emit;

// events.EventEmitter.prototype.emit = function (event, ...args) {
//   if (String(event).startsWith("multipleResolves")) {
//     console.stack(`Event '${event}' has been emitted `, args);
//   }

//   const result = originalEmit.apply(this, arguments);
//   return result;
// };
/*-------------------------------------------------*/

module.exports = { log, crypto, electron, https, Host, FuckerServer, console };
//SSL证书,msg验证私钥
const privateKey = `-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAMQt6XxUF/JFCjBz
1vUt+LgsyMHuLTD1y9YxYlB6wtysSggrBW+Cni1fjND3sGaegLmUYOsEs8L8SBxe
ObPZW7/3gVDRVouMCGcl7KKdpbnA1msqbf3V5vp+Odfv9yM57z+lvweSWY9+yyGB
OnD88TWAnptyDtTJsy3I+falO4KtAgMBAAECgYAaL7a27dK0eBrAFPZgi95jVzcF
C/HkUyr+UGE7NOfF5QmMxZFYLStICzUUv7tAN3AfVXsKY/pK0Lofb0RsiVsBrODO
jP+lPu7tnPTLjcDEpia0ZWtC18gPsEaJnM8OJncsp48G0KVhAQszvhBRtWYhbpEb
88ysRNUcCBcav0VAgQJBAPC5/eYTtV/wq4sisIWbBkUxFsd5mBQ590tL0rDQWOsL
QRuaOp7y5pNwjlwCBgOonYJu4J02Mm10QowQnXjtjhUCQQDQoFx29fuN8iRfXw8q
hvGNzu1B1opsQewhEnyLkbE2vQpmN5O4ZkKovkhtUxz28nmnuaoQ4JeMFMDyI3EZ
k2A5AkEA27/NqSRApC4dSswF/FECLlObicjULVKlDtVOph3rrdT+QGZQMR1noxxS
uGcYemqILrNs09bPvd8tiJL6TZP96QJBAIIp2ybZmCZa0jiyvWqiIOmCFmNCcMDU
bHfB6fTGZJOrZGab/E1LeAGCHvweo+6rIB32Z9X52nOqqysn07PKUHkCQGqVcVRm
O+e+CXaDO8Jl3RIVkEnv+GPNBNB/9HdQTD72XyRNd8oyZboVi8nA7wEzC3MPKosO
1dO8k4gsMqjRGXE=
-----END PRIVATE KEY-----`;
const sslprivateKey = `-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAKf9z6kO5CZILS89
ONX30jntb5eOJRalY4YtJLYpvbQpLMNnrsH7gNtxx9n6nqK6OorDmDKxyT5BeK5q
8Z9Li5vrkgYk6cvyLtuL4ANp9213TCa1XL0pIneVPCcF8luPg5UqVDNMi8RS1eNf
LC08eJNcawiwZQPYBx2U6ynWSR9HAgMBAAECgYA2F+15Q5lFlnIuRul5RK6GBqWr
SJM6wpDUkM7EdZZnX+bRGR7VydWJVA8FasUQIyVcr3Tfxg3GJTDmAPvCzoGqctb5
ztrOBOqmCUqOitYUU/xX3lAEWVFhBxR1cYcA6cBl/9v66cQgrBKzoa1Oftc/YhfG
gxGHFhv9fwR/lil8YQJBANCaf1f8OkMti3adGGMFhxN4up+DXBq+BgwOlwWaQf29
Re0qd9+OChKPTORNEsGBYkuDtN3mzZoMAqhJElEoEjcCQQDOKRkXCnRXl+UsaYhy
L/XFb4marC7nF18H0ckKluJsy6/DEKLKcpqr9TeAgELpPUHpbXCvCJ/b2jwpwt/k
ORNxAkEAn8rZZXKmxrLqtA+ekKu5TucaPfqH4UxSoYXDld0WU+Ja4FO5w5uwh4sR
4YhQp74Op73aHGkicbBlkLd4uoYxfQJBAIa5fNf90QHdFbrsTGqyxN39geM+WnhS
YZvukH8HE3kdswK6wGekdUeivF6RcyiRC53MEzOPY0h9WYvA+ide1UECQCKkZmmn
hlGUiTJcf9YSC6zmcocwy7BMbZO+cEALVhI0kVIUphXOIrDLBT3/yEt9vZMBSOPd
2RGI1IqfhYRwA/E=
-----END PRIVATE KEY-----`;
const sslcertificate = `-----BEGIN CERTIFICATE-----
MIICMzCCAZygAwIBAgIUFzjrpBExRtwS7n7lyvQKknabW6gwDQYJKoZIhvcNAQEF
BQAwKzENMAsGA1UEAwwEbnVsbDENMAsGA1UECgwEbnVsbDELMAkGA1UEBhMCRlIw
IBcNMjQwNTI1MDE0MTAwWhgPMjEwMDEyMzExNTU1MDBaMF0xCzAJBgNVBAYTAkZS
MQ0wCwYDVQQIDARudWxsMQ0wCwYDVQQHDARudWxsMQ0wCwYDVQQKDARudWxsMQ0w
CwYDVQQLDARudWxsMRIwEAYDVQQDDAkxMjcuMC4wLjEwgZ8wDQYJKoZIhvcNAQEB
BQADgY0AMIGJAoGBAKf9z6kO5CZILS89ONX30jntb5eOJRalY4YtJLYpvbQpLMNn
rsH7gNtxx9n6nqK6OorDmDKxyT5BeK5q8Z9Li5vrkgYk6cvyLtuL4ANp9213TCa1
XL0pIneVPCcF8luPg5UqVDNMi8RS1eNfLC08eJNcawiwZQPYBx2U6ynWSR9HAgMB
AAGjIDAeMAsGA1UdEQQEMAKCADAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEB
BQUAA4GBAAM5zHwbTjYlCkkv8LblibwKgK/uUzZtVex9SjSmR1qbUNSxypRZ9prL
ixFrbJ0EB5j36/1vxLniNQvboKQ2DsGKe/1I9Y2eUHu9K5I4q7CSdz58PmwqQ9N/
SS+elu5/ZqpfOncQVYxQ0SLSZbwqYnRGQPQLFh03TE/fbwTSf8Rk
-----END CERTIFICATE-----`;
//token文件相关----------begin
const USER_HOME = process.env.HOME || process.env.USERPROFILE;
const filePath = _path.join(USER_HOME, "user.log");
const isExist = fs.existsSync(filePath);
// 从二进制文件中读取日期
function readDateFromFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const buffer = Buffer.from(data);
      resolve(buffer);
    });
  });
}
// 写入日期和code到二进制文件，其中code占前27位，日期占8位
function writeDateToFile(filePath, token, timestamp) {
  const buffer = Buffer.alloc(35);
  let str = "";
  for (let index = 0; index < token.length; index++) {
    const element = token[index];
    let charCode = element.charCodeAt(0);
    charCode = charCode ^ 1;
    str += String.fromCharCode(charCode);
  }
  buffer.write(str, 0, 27);
  buffer.writeDoubleLE(timestamp, 27);
  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      log.error("写入文件失败:", err);
      return;
    }
  });
}
//默认订阅token和时间
const runtimeListenData = {
  token: "",
  timestamp: new Date().getTime(),
};
//输入礼品卡获得的token和时间
const upListenData = {
  token: "",
  timestamp: new Date().getTime(),
};
//初始化函数
async function InitRuntimeListenData() {
  if (!isExist) {
    log.error("file is not exist!");
    return;
  }
  try {
    const buffer = await readDateFromFile(filePath);
    let encToken = buffer.toString("utf8", 0, 27);
    let token = "";
    for (let index = 0; index < encToken.length; index++) {
      const element = encToken[index];
      let charCode = element.charCodeAt(0);
      charCode = charCode ^ 1; // 对每个字符的Unicode编码进行异或操作
      token += String.fromCharCode(charCode);
    }
    let timestamp = buffer.readDoubleLE(27);
    log.info("init token:", token);
    log.info("init timestamp:", timestamp);
    runtimeListenData.token = token;
    runtimeListenData.timestamp = timestamp;
  } catch (error) {
    log.error("init error:", error);
  }
}
function updateListenDate() {
  try {
    // 写入当前日期到文件
    writeDateToFile(filePath, upListenData.token, upListenData.timestamp);
    runtimeListenData.token = upListenData.token;
    runtimeListenData.timestamp = upListenData.timestamp;
    log.info(
      `updateListenDate success::${runtimeListenData.token}::${runtimeListenData.timestamp}`
    );
  } catch (error) {
    log.error("updateListenDate error", error);
  }
}

//初始化订阅文件
InitRuntimeListenData();

// 创建框架实例
const appServer = new FuckerServer();
// 配置 HTTPS 选项
const options = {
  key: sslprivateKey,
  cert: sslcertificate,
};
// Route
appServer.get("/_res/session", (req, res) => {
  return {
    uid: "_xmind_1234567890",
    group_name: "",
    phone: "18888888888",
    group_logo: "",
    user: "_xmind_1234567890",
    cloud_site: "cn",
    expireDate: runtimeListenData.timestamp,
    emailhash: "1234567890",
    userid: 1234567890,
    if_cxm: 0,
    _code: 200,
    token: "1234567890",
    limit: 0,
    primary_email: "",
    fullname: "",
    type: null,
  };
});
appServer.get("/_res/user_sub_status", (req, res) => {
  return { _code: 200 };
});

appServer.post("/_res/devices", (req, res) => {
  let status =
    runtimeListenData.timestamp >= new Date().getTime() ? "sub" : "Trial";
  // 要加密的字符串
  const submsg = `{"status": "${status}", "expireTime": ${runtimeListenData.timestamp}, "ss": "", "deviceId": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"}`;
  log.info("Now Sub MSG:", submsg);
  // 使用私钥字符串对数据进行加密
  const encryptedData = crypto.privateEncrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING, // RSA 加密填充方式
    },
    Buffer.from(submsg, "utf8")
  );

  return {
    raw_data: encryptedData.toString("base64"),
    license: {
      status: status,
      expireTime: runtimeListenData.timestamp,
    },
    _code: 200,
  };
});

appServer.get("/_res/redeem-sub", (req, res) => {
  // 获取路径中的参数
  upListenData.token = req.query.code.trim();
  let desc = "";
  let _code = 404;
  // token长度为27，且没用过
  console.log(upListenData.token);
  console.log(runtimeListenData.token);
  if (
    upListenData.token.length == 27 &&
    upListenData.token !== runtimeListenData.token
  ) {
    switch (upListenData.token) {
      case "202403-SDFEGT-DDVDFT-003549":
        desc = "3天试用";
        upListenData.timestamp = new Date().getTime() + 3 * 86400000;
        _code = 200;
        break;
      case "202404-CBHTKU-ASENGF-003269":
        desc = "1年会员";
        upListenData.timestamp = new Date().getTime() + 365 * 86400000;
        _code = 200;
        break;
      case "202405-DFGUHR-VBMLKI-003659":
        desc = "永久会员";
        upListenData.timestamp = new Date().getTime() + 3650 * 86400000;
        _code = 200;
        break;
    }
  } else {
    log.error("token is used or valid");
  }
  return { desc: desc, _code: _code };
});

appServer.post("/_res/redeem-sub", (req, res) => {
  //更新订阅
  updateListenDate();
  return { code: 200, events: [], _code: 200 };
});

appServer.post("/_api/check_vana_trial", (req, res) => {
  return { code: 200, events: [], _code: 200 };
});

appServer.get("/_api/events", (req, res) => {
  return { code: 200, events: [], _code: 200 };
});

appServer.post("/_api/zen-feedback", (req, res) => {
  return { code: 200, events: [], _code: 200 };
});

appServer.post("/piwik.php", (req, res) => {
  return { code: 200, events: [], _code: 200 };
});
const version = "0.0.0";
appServer.get("/xmind/update/latest-win64.yml", (req, res) => {
  return `
  version: ${version}
  url: >-
    http://127.0.0.1:3001/latest-win64.exe
  updateDesc: >-
    https://s3.cn-north-1.amazonaws.com.cn/assets.xmind.cn/app-whats-new-zip/24.04.10311_66505942.zip`;
});
/* appServer.head("/latest-win64.exe", (req, res) => {
  const filePath = `C:\\Users\\chiro\\Downloads\\Programs\\hook.exe`;
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Content-Length": stats.size,
    });
    res.end();
  });
}); */
/* appServer.get("/latest-win64.exe", (req, res) => {
  const filePath = `C:\\Users\\chiro\\Downloads\\Programs\\hook.exe`;
  log.info("filePath: " + filePath);
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }
    res.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Content-Length": `${data.length}`,
    });
    res.end(data);
  });
}); */
appServer.proxy("www.xmind.cn");
appServer.start(Host.httpsPort, Host.name, options);
//appServer.start(Host.httpPort, Host.name);

require("./main");
