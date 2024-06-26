const fastify = require("fastify");
const proxy = require("@fastify/http-proxy");
const request = require("../utils/request");
const utils = require("../utils/otherUtils");
const { sslprivateKey, sslcertificate, hostInfo } = require("../config");
const log = require("../utils/log");
//hook consloe 获取机器码
let globalDeviceCode = "";
let globalTokenCode = "";
let xmindOfflineToken = {};
console.info = (...args) => {
  args.forEach((a) => {
    const match = a.match(/Device ID: ([\w-]+)/);
    if (match && match[1]) {
      globalDeviceCode = match[1];
      console.info = () => {};
    }
  });
};
//SSL证书
const httpsOptions = {
  key: sslprivateKey,
  cert: sslcertificate
};
const httpServer = fastify();
const httpsServer = fastify({ https: httpsOptions });

//初始化离线激活码 和 更新离线激活码
const { initXmindOfflineToken, updateXmindOfflineToken } = require("./init");

// 注册路由
httpsServer.get("/_res/session", async (req, res) => {
  log.colors("get session");
  return {
    uid: "_xmind_1234567890",
    group_name: "",
    phone: "1234567890123",
    group_logo: "",
    user: "_xmind_1234567890",
    cloud_site: "cn",
    expireDate: 1700000000000,
    emailhash: "1234567890",
    userid: 1234567890,
    if_cxm: 0,
    _code: 200,
    token: "1234567890",
    limit: 0,
    primary_email: "",
    fullname: "",
    type: null
  };
});

httpsServer.get("/_res/user_sub_status", async (req, res) => {
  log.colors("get user_sub_status");
  return { _code: 200 };
});

httpsServer.post("/_res/devices", async (req, res) => {
  log.info("post /_res/devices and device = " + globalDeviceCode);
  const resData = await request.get("/api/v2/listen", {
    params: { deviceCode: globalDeviceCode }
  });
  const isServerErr = resData.status == 500;
  //无订阅
  let submsg = `{"status": "trial", "expireTime": 0, "ss": "", "deviceId": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"}`;
  let license = { status: "trial", expireTime: 0 };
  //服务器错误,尝试离线激活
  if (isServerErr && xmindOfflineToken) {
    log.info(xmindOfflineToken);
    log.info(
      "post /_res/devices server 404 not found , try to get offline token"
    );
    return {
      raw_data: xmindOfflineToken,
      license: { status: "sub", expireTime: 2750690411040 },
      _code: 200
    };
  } else if (resData.data.code == 200) {
    //服务器无错误,获取在线授权信息
    const encData = resData.data.data.raw_data;
    license = resData.data.data.license;
    submsg = utils.decryptAesData(encData);
  }
  const rsaEncData = utils.encryptRsaData(submsg);
  log.info("Now SubMSG is:", submsg);
  return {
    raw_data: rsaEncData,
    license: license,
    _code: 200
  };
});

httpsServer.get("/_res/redeem-sub", async (req, res) => {
  globalTokenCode = req.query.code.trim();
  //todo 简单校验长度
  if (globalTokenCode.length <= 10 || globalTokenCode.length >= 30) {
    return { code: 400, events: [], _code: 400 };
  }
  const resData = await request.post("/api/v2/listen", {
    tokenCode: globalTokenCode
  });
  return { desc: resData.data.data.desc, _code: resData.data.code };
});

httpsServer.post("/_res/redeem-sub", async (req, res) => {
  const resData = await request.put("/api/v2/listen", {
    tokenCode: globalTokenCode,
    deviceCode: globalDeviceCode
  });
  updateXmindOfflineToken(resData.data.data.raw_data);
  return { code: 200, events: [], _code: 200 };
});

httpsServer.post("/_api/check_vana_trial", async (req, res) => {
  log.colors("get check_vana_trial");
  return { code: 200, events: [], _code: 200 };
});

httpsServer.get("/_api/events", async (req, res) => {
  log.colors("get events");
  return { code: 200, events: [], _code: 200 };
});

httpsServer.post("/_api/zen-feedback", async (req, res) => {
  log.colors("get zen-feedback");
  return { code: 200, events: [], _code: 200 };
});

httpsServer.post("/piwik.php", async (req, res) => {
  log.colors("get piwik.php");
  return { code: 200, events: [], _code: 200 };
});

//https://www.xmind.cn/xmind/update/latest-mac.json
httpsServer.get("/xmind/update/latest-mac.json", async (req, res) => {
  return {
    version: "0.0.0",
    url: "",
    name: "",
    updateDesc: ""
  };
});
//https://www.xmind.cn/xmind/update/latest-win64.yml
httpsServer.get("/xmind/update/latest-win64.yml", async (req, res) => {
  log.colors("get latest-win64.yml");
  return `
    version: 0.0.0`;
});

const proxyTarget = "https://www.xmind.cn";
// 注册代理插件
httpsServer.register(proxy, {
  upstream: proxyTarget,
  preValidation: async (request, reply) => {
    log.colors("proxy " + request.url);
  }
});

const startServers = async () => {
  xmindOfflineToken = await initXmindOfflineToken();
  await httpServer.listen({ port: hostInfo.httpPort, host: hostInfo.name });
  log.colors(
    `HTTP server listening on http://${hostInfo.name}:${hostInfo.httpPort}`
  );
  await httpsServer.listen({ port: hostInfo.httpsPort, host: hostInfo.name });
  log.colors(
    `HTTPS server listening on https://${hostInfo.name}:${hostInfo.httpsPort}`
  );
};

module.exports = {
  startServers
};
