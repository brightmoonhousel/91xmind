// 输入激活码后开启离线订阅
const xmindOfflineToken = {
  raw_data: `VxDmQYPKsNBw1XIIP7Ak7J0pavWyOYljC63kS3oT7K4onXR60Xv4R0Wf9LvVADoP/7xhoEeQhbKJLiZBnZAPg7eljLDKI/i/BngYcroMDUYTVlMVI8RaozLHFOcQw3MQ+iD6xAX0qMKaZFQNFAoHZmJDaN6JBSxsvpwQ1HcK6f0=`
};

//初始化函数
async function initXmindOfflineToken() {
  // 本地订阅文件相关
  const USER_HOME = process.env.HOME || process.env.USERPROFILE;
  const xmindOfflineTokenFilePath = _path.join(USER_HOME, "xmindOfflineToken");
  const isExist = fs.existsSync(xmindOfflineTokenFilePath);
  if (!isExist) {
    log.error("xmindOfflineToken is not exist!");
    return;
  }
  try {
    const data = readDateFromFile();
  } catch (error) {
    log.error("init error:", error);
  }
}

//更新订阅token和时间
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
initXmindOfflineToken();

// 创建框架实例
const appServer = new FuckerServer();
// 配置 HTTPS 选项
const options = {
  key: sslprivateKey,
  cert: sslcertificate
};
// Route
appServer.get("/_res/session", (req, res) => {
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
appServer.get("/_res/user_sub_status", (req, res) => {
  return { _code: 200 };
});
//1700000000000
appServer.post("/_res/devices", (req, res) => {
  log.error("devices:", DeviceCode);
  // 要加密的字符串
  const submsg = `{"status": "", "expireTime": 0, "ss": "", "deviceId": "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"}`;
  log.info("Now Sub MSG:", submsg);
  // 使用私钥字符串对数据进行加密
  const encryptedData = crypto.privateEncrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING // RSA 加密填充方式
    },
    Buffer.from(submsg, "utf8")
  );

  return {
    raw_data: encryptedData.toString("base64"),
    license: {
      status: "",
      expireTime: 0
    },
    _code: 200
  };
});

appServer.get("/_res/redeem-sub", (req, res) => {
  log.info("device:", DeviceCode);
  // 获取路径中的参数
  upListenData.token = req.query.code.trim();
  let desc = "";
  // token长度为27，且没用过
  log.info(upListenData.token);
  log.info(runtimeListenData.token);
  if (
    upListenData.token.length == 27 &&
    upListenData.token !== runtimeListenData.token
  ) {
    switch (upListenData.token) {
      case "202403-SDFEGT-DDVDFT-003549":
        desc = "3天试用";
        upListenData.timestamp = new Date().getTime() + 3 * 86400000;
        break;
      case "202404-CBHTKU-ASENGF-003269":
        desc = "1年会员";
        upListenData.timestamp = new Date().getTime() + 365 * 86400000;
        break;
      case "202405-DFGUHR-VBMLKI-003659":
        desc = "永久会员";
        upListenData.timestamp = new Date().getTime() + 3650 * 86400000;
        break;
    }
    if (desc !== "") return { desc: desc, _code: 200 };
  }
  return { desc: desc, _code: 404 };
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

//https://www.xmind.cn/xmind/update/latest-mac.json
appServer.get("/xmind/update/latest-mac.json", (req, res) => {
  return {
    version: "0.0.0",
    url: "",
    name: "",
    updateDesc: ""
  };
});
//https://www.xmind.cn/xmind/update/latest-win64.yml
appServer.get("/xmind/update/latest-win64.yml", (req, res) => {
  log.info("get latest-win64.yml");
  return `
  version: 0.0.0`;
});

appServer.proxy("www.xmind.cn");
appServer.start(Host.httpsPort, Host.name, options);
//appServer.start(Host.httpPort, Host.name);

require("./main");
