const simpleServer = require("../utils/simpleServer");
const httpsServer = new simpleServer();
const request = require("../utils/request");
const utils = require("../utils/fileUtils");
const { sslprivateKey, sslcertificate, hostInfo } = require("../config");
const log = require("../utils/logUtils");
const { initXmindOfflineToken, updateXmindOfflineToken } = require("./offlineTokenInit");
//hook consloe 获取机器码
let globalDeviceCode = "";
let globalTokenCode = "";
let xmindOfflineToken = {};
const orgConsoleInfo = console.info;
console.info = (...args) => {
  args.forEach((a) => {
    const match = a.match(/Device ID: ([\w-]+)/);
    if (match && match[1]) {
      globalDeviceCode = match[1];
      log.info("globalDeviceCode: " + globalDeviceCode);
    }
  });
  if (!process.argv.includes("@")) {
    return;
  }
  orgConsoleInfo.apply(console, args);
};
//SSL证书
const httpsOptions = {
  key: sslprivateKey,
  cert: sslcertificate
};

// 注册路由
httpsServer.post("/_res/devices", async (req, res) => {
  //初始化订阅
  let submsg = `{"status": "trial", "expireTime": 0, "ss": "", "deviceId": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"}`;
  let license = { status: "trial", expireTime: 0 };

  const { body } = req;
  //判断请求是否携带设备码
  if (body?.device_id) {
    globalDeviceCode = body.device_id;
  }

  log.info("post /_res/devices and device = " + globalDeviceCode);

  //获取远程授权数据
  const resData = await request.get("/api/v2/listen", {
    params: { deviceCode: globalDeviceCode }
  });

  const isServerErr = resData.status == 500;
  //服务器错误,尝试离线激活
  if (isServerErr && xmindOfflineToken) {
    log.info(xmindOfflineToken);
    log.info("post /_res/devices server 404 not found , try to get offline token");
    return {
      raw_data: xmindOfflineToken,
      license: { status: "sub", expireTime: 2750690411040 },
      _code: 200
    };
    //todo
  } else if (resData.data.code == 200) {
    //服务器无错误,获取在线授权信息
    const encData = resData.data.data?.raw_data;
    submsg = utils.decryptAesData(encData);
    submsObj = JSON.parse(submsg);
    const { status, expireTime } = submsObj;
    license = { status, expireTime };
  }
  const rsaEncData = utils.encryptRsaData(submsg);
  log.info("Now SubMSG is:", submsg);
  return {
    raw_data: rsaEncData || "",
    license: { ...license, ...body },
    _code: 200
  };
});

httpsServer.get("/_res/redeem-sub", async (req, res) => {
  globalTokenCode = req?.query.code.trim();

  if (globalTokenCode.length <= 10 || globalTokenCode.length >= 30) {
    log.info("授权码本地校验未通过");
    return { code: 404, events: [], _code: 404 };
  }
  const resData = await request.post("/api/v2/listen", {
    tokenCode: globalTokenCode
  });
  log.info("授权码请求成功:", resData.data); // { code: 400, events: [], _code: 400 }
  return {
    desc: resData.data?.desc,
    code: resData.data?.code,
    _code: resData.data?.code
  };
});

httpsServer.post("/_res/redeem-sub", async (req, res) => {
  const resData = await request.put("/api/v2/listen", {
    tokenCode: globalTokenCode,
    deviceCode: globalDeviceCode
  });
  if (resData.data.code == 200) {
    log.info("授权码与设备码绑定成功,下载离线激活码:", resData.data);
    updateXmindOfflineToken(resData.data.raw_data);
  }
  return { code: 200, events: [], _code: 200 };
});
httpsServer.get("/_res/session", async (req, res) => {
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
  return { _code: 200 };
});

httpsServer.post("/_api/check_vana_trial", async (req, res) => {
  return { code: 200, events: [], _code: 200 };
});

httpsServer.get("/_api/events", async (req, res) => {
  return { code: 200, events: [], _code: 200 };
});

httpsServer.post("/_api/zen-feedback", async (req, res) => {
  return { code: 200, events: [], _code: 200 };
});

httpsServer.post("/piwik.php", async (req, res) => {
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
  return `
    version: 0.0.0`;
});

httpsServer.proxy("www.xmind.cn");
const startServers = async () => {
  xmindOfflineToken = await initXmindOfflineToken();
  httpsServer.start(hostInfo.httpPort, hostInfo.name);
  httpsServer.start(hostInfo.httpsPort, hostInfo.name, httpsOptions);
};
module.exports = {
  startServers
};
