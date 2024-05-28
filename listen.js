const https = require("./https.js");
const url = require("url");
const fs = require("fs");
const crypto = require("./crypto");
const _path = require("path");
const electron = require("./electron");
electron.app.commandLine.appendSwitch("--ignore-certificate-errors", "true");
const debug = true;
// 私钥字符串（示例，请替换为实际的私钥字符串）
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
// SSL 证书的内容
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
// 构建文件路径
const USER_HOME = process.env.HOME || process.env.USERPROFILE;
const filePath = _path.join(USER_HOME, "user.log");
const isExist = fs.existsSync(filePath);
//是否更新
let isUpdate = false;
//日志
function log(...args) {
  if (debug)
    console.log(
      "\n---------[YueYa log begin]-----------",
      "\n[" + new Date().toLocaleString() + "]",
      ...args,
      "\n---------[YueYa log end]-------------\n"
    );
}
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
// 写入日期和code到二进制文件，其中code占前17位，日期占8位
function writeDateToFile(filePath, code, date) {
  // 创建一个Buffer对象，长度为25，用于存储code和date
  const buffer = Buffer.alloc(25);
  // 将code转换乱码
  let str = "";
  for (let index = 0; index < code.length; index++) {
    const element = code[index];
    let charCode = element.charCodeAt(0);
    charCode = charCode ^ 1; // 对每个字符的Unicode编码进行异或操作
    str += String.fromCharCode(charCode);
  }
  buffer.write(str, 0, 17);
  // 将日期转换为Unix时间戳，并写入buffer的后8位
  const timestamp = date.getTime();
  buffer.writeDoubleLE(timestamp, 17);
  // 将buffer写入文件
  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      log("写入文件失败:", err);
      return;
    }
  });
}
//字符串判空
function isNotEmptyStr(s) {
  if (typeof s == "string" && s.length > 0) {
    return true;
  }
  return false;
}
//默认
const listener = {
  token: "",
  timestamp: 1713722566174,
};
const updateListenr = {
  token: "",
  day: 0,
};
async function init() {
  if (!isExist) {
    log("file is not exist!");
    return;
  }
  try {
    const buffer = await readDateFromFile(filePath);
    let str1 = buffer.toString("utf8", 0, 17);
    let str = "";
    for (let index = 0; index < str1.length; index++) {
      const element = str1[index];
      let charCode = element.charCodeAt(0);
      charCode = charCode ^ 1; // 对每个字符的Unicode编码进行异或操作
      str += String.fromCharCode(charCode);
    }
    const readDate = new Date(buffer.readDoubleLE(17));
    log("init token:", str);
    log("init timestamp:", readDate);
    listener.token = str;
    listener.timestamp = readDate.getTime();
  } catch (error) {
    log("init error:", error);
  }
}
//初始化
init();
//文件加载
async function listen() {
  if (!isExist) {
    log("file is not exist");
    return listener;
  } else if (!isUpdate) {
    log("file is exist,but not update");
    return listener;
  }
  log("file is exist and need update");
  try {
    const buffer = await readDateFromFile(filePath);
    let str1 = buffer.toString("utf8", 0, 17);
    let str = "";
    for (let index = 0; index < str1.length; index++) {
      const element = str1[index];
      let charCode = element.charCodeAt(0);
      charCode = charCode ^ 1; // 对每个字符的Unicode编码进行异或操作
      str += String.fromCharCode(charCode);
    }
    const readDate = new Date(buffer.readDoubleLE(17));
    log("update token:", str);
    log("update timestamp:", readDate);
    listener.token = str;
    listener.timestamp = readDate.getTime();
    isUpdate = false;
  } catch (error) {
    log("update error:", error);
  }
  return listener;
}

function updateListen() {
  log("updateListen success");
  // 异步操作
  // 假设这里执行一些异步操作，并且在操作完成后调用 resolve 或 reject
  const currentDate = new Date();
  const updatedDate = new Date(
    currentDate.getTime() + updateListenr.day * 86400000
  );
  try {
    // 写入当前日期到文件
    writeDateToFile(filePath, updateListenr.token, updatedDate);
    isUpdate = true;
    listener.timestamp = updatedDate.getTime();
    listener.token = updateListenr.token;
  } catch (error) {}
}

// 创建HTTP服务器
const server = https.createServer(
  { rejectUnauthorized: false, key: sslprivateKey, cert: sslcertificate },
  (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;
    log(path, method);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    if (path === "/_res/session" && method === "GET") {
      listen().then((listener) => {
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            uid: "_xmind_1234567890",
            group_name: "",
            phone: "18888888888",
            group_logo: "",
            user: "_xmind_1234567890",
            cloud_site: "cn",
            expireDate: listener.timestamp,
            emailhash: "1234567890",
            userid: 1234567890,
            if_cxm: 0,
            _code: 200,
            token: "1234567890",
            limit: 0,
            primary_email: "",
            fullname: "",
            type: null,
          })
        );
      });
    } else if (path === "/_api/check_vana_trial" && method === "POST") {
      res.statusCode = 200;
      res.end(JSON.stringify({ code: 200, _code: 200 }));
      // } else if (path === "/_res/get-vana-price" && method === "GET") {
      //   res.statusCode = 200;
      //   res.end(
      //     JSON.stringify({
      //       products: [
      //         { month: 6, price: { cny: 0, usd: 0 }, type: "bundle" },
      //         { month: 12, price: { cny: 0, usd: 0 }, type: "bundle" },
      //       ],
      //       code: 200,
      //       _code: 200,
      //     })
      //   );
    } else if (path === "/_api/events" && method === "GET") {
      res.statusCode = 200;
      res.end(JSON.stringify({ code: 200, events: [], _code: 200 }));
    } else if (path === "/_res/user_sub_status" && method === "GET") {
      res.statusCode = 200;
      res.end(JSON.stringify({ _code: 200 }));
    } else if (path === "/piwik.php" && method === "POST") {
      res.statusCode = 200;
      res.end(JSON.stringify({ code: 200, _code: 200 }));
    } else if (path.startsWith("/_res/token/") && method === "POST") {
      listen().then((listener) => {
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            uid: "_xmind_1234567890",
            group_name: "",
            phone: "18888888888",
            group_logo: "",
            user: "_xmind_1234567890",
            cloud_site: "cn",
            expireDate: listener.timestamp,
            emailhash: "1234567890",
            userid: 1234567890,
            if_cxm: 0,
            _code: 200,
            token: "1234567890",
            limit: 0,
            primary_email: "",
            fullname: "",
            type: null,
          })
        );
      });
    } else if (path === "/_res/devices" && method === "POST") {
      listen().then((listener) => {
        let status =
          listener.timestamp >= new Date().getTime() ? "sub" : "Trial";
        // 要加密的字符串
        const submsg = `{"status": "${status}", "expireTime": ${listener.timestamp}, "ss": "", "deviceId": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"}`;
        log("Sub MSG:", submsg);
        // 使用私钥字符串对数据进行加密
        const encryptedData = crypto.privateEncrypt(
          {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PADDING, // RSA 加密填充方式
          },
          Buffer.from(submsg, "utf8")
        );
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            raw_data: encryptedData.toString("base64"),
            license: {
              status: status,
              expireTime: listener.timestamp,
            },
            _code: 200,
          })
        );
      });
    } else if (path === "/_res/redeem-sub" && method === "GET") {
      // 获取路径中的参数
      const params = parsedUrl.query;
      updateListenr.token = params.code.trim(); //去除空格
      let desc = "";
      let _code = 404;
      // token长度为27，且没用过
      if (
        updateListenr.token.length == 27 &&
        updateListenr.token !== listener.token
      ) {
        switch (updateListenr.token) {
          case "202403-SDFEGT-DDVDFT-003549":
            desc = "3天试用";
            updateListenr.day = 3;
            _code = 200;
            break;
          case "202404-CBHTKU-ASENGF-003269":
            desc = "1年会员";
            updateListenr.day = 365;
            _code = 200;
            break;
          case "202405-DFGUHR-VBMLKI-003659":
            desc = "永久会员";
            updateListenr.day = 3650;
            _code = 200;
            break;
        }
      } else {
        log("token is used or valid");
      }
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          desc: desc,
          _code: _code,
        })
      );
    } else if (path === "/_res/redeem-sub" && method === "POST") {
      //更新订阅
      updateListen();
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          _code: 200,
        })
      );
    } else if (path === "/xmind/update/latest-win64.yml" && method === "GET") {
      log("latest-win64.yml");
      res.statusCode = 200;
      res.end(
        `version: 25.04.10311
url: >-
  https://127.0.0.1:3000/520.exe
name: 520.exe
updateDesc: >-
  https://s3.cn-north-1.amazonaws.com.cn/assets.xmind.cn/app-whats-new-zip/24.04.10311_66505942.zip
updateSize: 157.9
md5: 7086889f57d2c48302c872b0dfb21980
releaseNotes: |-
  1. 优化了按主分支拆分模式下导出图片的体验；
  2. 优化了部分界面设计和文案；
  3. 修复了保存时可能会报错的问题；
  4. 修复了大纲模式下换行时的问题；
  5. 修复了标签的右键菜单删除选项失效的问题；
  6. 修复了编辑公式时输入空格可能会报错的问题；
  7. 修复了部分其它已知问题。
releaseNotes-en-US: |-
  1. 优化了按主分支拆分模式下导出图片的体验；
  2. 优化了部分界面设计和文案；
  3. 修复了保存时可能会报错的问题；
  4. 修复了大纲模式下换行时的问题；
  5. 修复了标签的右键菜单删除选项失效的问题；
  6. 修复了编辑公式时输入空格可能会报错的问题；
  7. 修复了部分其它已知问题。
releaseNotes-cn: |-
  1. Improved the experience of Export to PNG in Split by Main Branch mode;
  2. Optimized some interface designs and wording;
  3. Fixed the possible error when saving maps;
  4. Fixed issues with line breaks in Outliner mode;
  5. Fixed the issue that the Delete option for Label was not working;
  6. Fixed the possible error when entering a space while editing formulas;
  7. Fixed some other known issues.
releaseNotes-zh-CN: |-
  1. Improved the experience of Export to PNG in Split by Main Branch mode;
  2. Optimized some interface designs and wording;
  3. Fixed the possible error when saving maps;
  4. Fixed issues with line breaks in Outliner mode;
  5. Fixed the issue that the Delete option for Label was not working;
  6. Fixed the possible error when entering a space while editing formulas;
  7. Fixed some other known issues.`
      );
    } else if (path === "/520.exe") {
      // 读取文件
      const tempFolder =
        process.env.TEMP || process.env.TMP || process.env.TMPDIR;
      const filePath = _path.join(tempFolder, "520.exe");
      // 检查文件是否存在
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          // 如果文件不存在，返回 404 Not Found
          res.writeHead(404);
          res.end("File Not Found");
        } else {
          // 如果文件存在，读取文件并发送给客户端
          const fileStream = fs.createReadStream(filePath);
          res.setHeader('Content-Disposition', 'attachment; filename="' + _path.basename(filePath) + '"');

          fileStream.pipe(res);
        }
      });
    } else {
      req.headers.host = "www.xmind.cn";
      const options = {
        hostname: "www.xmind.cn",
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
        console.error("proxy error:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy error");
      });
    }
  }
);

const hostname = "127.0.0.1";
const port = 3000;
server.listen(port, hostname, () => {
  log(`Server running at http://${hostname}:${port}/`);
});
