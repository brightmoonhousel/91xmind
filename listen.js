const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const debug = false;

// 私钥字符串（示例，请替换为实际的私钥字符串）
const privateKey = `
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCogZ+CHGz+xyGO
J36YeUoBCFYebXPW49f8JavZMEc9yDc8OYXy9WLKG7GmRV7j9fhPP2E30EYD6Hu2
gdTDqsrPYyTkzml4bkh3gNUsAO5V2lxuOjRilzSY50MNMm2VzZPyrXSt0ZgPQSul
5H1K72JonENYw4uU3OmZZemApBaNG7Ogis6KIe8bMCJKsIwq3qb7+b5K+vkJAfD7
8nHWIDDIxkgzC7HyCyBrBW1TW7oyYgH2nHgmdwV6myDcV1IRup1hkvcx4TENPs8+
HYZBxtJ9yXWBhOsKAkVRlSvYkE5JUigi8YBMftUgxgFZqe1sCJCAaqQmy1dvxSeA
QziGuxe5AgMBAAECggEBAKeV+yiw0qn1K+cwWlSUVEiAnP24B3xRr+5DHQ1tWX0V
kfGgmBqReAXf0ye1WHFJoQJX231h8zBR2DAkIZHUW840IW4552Vx8TqA9AHGj0Lt
X/30f0MKdLIZVnNakuhow9qYLjHtANkzDJD5lK6hM/MsbkJqgHi12NHKLJfXGeKN
bD5DFIkM39mrrU8AWmxtSEdRindSLcZVnjv7YWaCRdWjkJcD5I1NpgpxNd9j+jum
rgmL4O4RNlNzO1p/cl9CutjH5Wl1cMH/y8U3GsXFaZWZ1K/AGnwl0AT50lWMUX8n
fUH3m5wxq/lhV0h3Vzc8h08kgXKpV57oUVZ9xDusnnECgYEA05hYpP3T8UC1SBnS
KUECy0pDZspaMHPYABhIdpOoR/q3woiK0xeyfWTbhy18yc/mBVUXC+SH6PWk/xVz
k/D8hfpAmU3nuAkvVHWst/NFpbgCN5MoyHCq29UzLJM698nI177zd1f0S5LookUG
OLi26lvPCmEoXaKSa9ZMQe/Lm/0CgYEAy95kiwIV1KJ0Me2K1fmJA3WQpSYL0cBv
5N9OSgJl41SCn1e69UpwwVBQDQmAhxoJCqXXiEkS7RIhcF3BVERoukDpDtdiD6av
tnan4R7djj6xcj+81DTE3POdbdcoCkjH+FrETd7X/2gpeo0kIBqE0fUJcl2D/E1v
oFYL1PebcW0CgYEAg+wL+HI43cVWQOm4WfgqYcyfUUsACA1xsj1xkFxnItlyEFtJ
EmtH4V4scI8vqjNwWgq/H68P/XKJuHALa0Voa6+m7u3fdqJjW+kyEk4eMkATQcsC
NlXocL7v9O6maS7phXmMGfBAY43odKNMSbkAcgVjhDknDZn6aDlnugRjkZECgYA4
NguW4G5QgLJ1CcAcG3+Rupq1TnY30U2I16FoepzJP4X8lV3xQCMyyggocBRGLAGO
NAfnhe53+2XI67DgoTQXFsqr0usw0Y7lSnYjdjU0gUi/7Z8NC7e0DF+953Mc0tCA
Q9aYefcobvnw1nW9fFJe6ac/J1W6/Ubn+JGumM79SQKBgDVgSiOyXgG7V1dERiAT
B/dS8Yc/4RQafnfqtzXKUpo2BJu3PHx1cmOTEBxn+gPOl090dbiM8yOPQR/7uHGQ
kjgD/o7pVy66bk44SHuq297MzXpkOHiLdtpKaYuaKIZzb0bhfovyaTReGb0vfsVo
hFup9gAFhkXo13NrZr5bd29P
-----END PRIVATE KEY-----`;
// 构建文件路径
const USER_HOME = process.env.HOME || process.env.USERPROFILE;
const filePath = path.join(USER_HOME, "user.log");
const isExist = fs.existsSync(filePath);
//是否更新
let isUpdate = false;
//日志
function log(...args) {
  if(debug)console.log(
    "\n---------[YueYa log begin]-----------",
    "\n[" + new Date().toLocaleString() + "]",
    ...args,
    "\n---------[YueYa log end]-----------\n"
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
const hostname = "127.0.0.1";
const port = 3000;
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
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
  } else if (path === "/_res/get-vana-price" && method === "GET") {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        products: [
          { month: 6, price: { cny: 0, usd: 0 }, type: "bundle" },
          { month: 12, price: { cny: 0, usd: 0 }, type: "bundle" },
        ],
        code: 200,
        _code: 200,
      })
    );
  } else if (path === "/_api/events" && method === "GET") {
    res.statusCode = 200;
    res.end(JSON.stringify({ code: 200, _code: 200 }));
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
      let status = listener.timestamp >= new Date().getTime() ? "sub" : "Trial";
      // 要加密的字符串
      const plaintext =
        '{"status": "sub", "expireTime": ' +
        listener.timestamp +
        ', "ss": "", "deviceId": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"}';
      log("msg:", plaintext);
      // 使用私钥字符串对数据进行加密
      const encryptedData = crypto.privateEncrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING, // RSA 加密填充方式
        },
        Buffer.from(plaintext, "utf8")
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
    }else{
      log("token is used or valid")
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
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

exports.log = log;
exports.debug = debug;

// 导入其他模块
require("./listen/crypto");
require("./listen/electron");
