const simpleServer = require("../utils/simpleServer");
const httpsServer = new simpleServer();
const request = require("../utils/request");
const utils = require("../utils/fileUtils");
const { sslprivateKey, sslcertificate, hostInfo } = require("../config");
const log = require("../utils/logUtils");
const { initXmindOfflineToken, updateXmindOfflineToken } = require("./offlineTokenInit");
//#region hook consloe 获取机器码
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
//#endregion

// 注册路由
httpsServer.post("/_res/devices", async (req, res) => {
  const defaultMsg = `{"status": "trial", "expireTime": 0, "ss": "", "deviceId": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"}`;
  const { body } = req;
  globalDeviceCode = body?.device_id || globalDeviceCode;
  const defaultResponse = {
    raw_data: utils.encryptRsaData(defaultMsg),
    license: { status: "trial", expireTime: 0, ...body },
    _code: 200
  };
  try {
    //初始化订阅
    log.info("当前用户信息", body);
    //获取远程授权数据
    const resData = await request.get("/api/v2/listen", {
      params: { deviceCode: globalDeviceCode }
    });
    if (resData.data?.code == 200) {
      const decDate = utils.decryptAesData(resData.data?.raw_data);
      const subMsgObj = JSON.parse(decDate);
      const rsaEncData = utils.encryptRsaData(decDate);
      log.info("远程授权数据获取成功", subMsgObj);
      return {
        raw_data: rsaEncData,
        license: { ...subMsgObj, ...body },
        _code: 200
      };
    }
    if (xmindOfflineToken) {
      const subMsgObj = JSON.parse(xmindOfflineToken);
      log.info("远程失败,获取本地授权数据", subMsgObj);
      if (subMsgObj.expireTime > new Date().getTime()) {
        return {
          raw_data: utils.encryptRsaData(xmindOfflineToken),
          license: { ...subMsgObj, ...body },
          _code: 200
        };
      } else {
        log.info("激活码已经过期");
      }
    }
    return defaultResponse;
  } catch (error) {
    log.error("授权数据获取失败", error);
    return defaultResponse;
  }
});

httpsServer.get("/_res/redeem-sub", async (req, res) => {
  globalTokenCode = req.query?.code.trim();

  if (globalTokenCode.length <= 10 || globalTokenCode.length >= 30) {
    log.info("授权码本地校验未通过");
    return { code: 404, events: [], _code: 404 };
  }
  const resData = await request.post("/api/v2/listen", {
    tokenCode: globalTokenCode
  });
  if (resData.data?.code == 200) {
    log.info("授权码请求成功:", resData.data); // { code: 400, events: [], _code: 400 }
    return {
      desc: resData.data?.desc,
      code: resData.data?.code,
      _code: resData.data?.code
    };
  }
  return { desc: "", code: 400, _code: 400 };
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
//#region
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

httpsServer.get("/xmind/update/latest-mac.json", async (req, res) => {
  return {
    version: "0.0.0",
    url: "",
    name: "",
    updateDesc: ""
  };
});

httpsServer.get("/xmind/update/latest-win64.yml", async (req, res) => {
  return `
    version: 0.0.0`;
});
//#endregion
httpsServer.proxy("www.xmind.cn");
const startServers = async () => {
  xmindOfflineToken = await initXmindOfflineToken();
  httpsServer.start(hostInfo.httpPort, hostInfo.name);
  httpsServer.start(hostInfo.httpsPort, hostInfo.name, {
    key: sslprivateKey,
    cert: sslcertificate
  });
};
module.exports = {
  startServers
};
