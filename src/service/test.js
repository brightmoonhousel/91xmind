const request = require("../utils/request");
const _path = require("path");
const log = require("../utils/log");
const USER_HOME = process.env.HOME || process.env.USERPROFILE;
const xmindOfflineTokenFilePath = _path.join(USER_HOME, "xmindOfflineToken");
const fileUtils = require("../utils/otherUtils");

let xmindOfflineToken = {};
const a = async () => {
  const resXmind = await request.get(
    "https://www.xmind.cn/xmind/update/latest-win64.yml"
  );
  const ymalString = resXmind.data
  log.info(ymalString);
};

//初始化函数
const initXmindOfflineToken = async () => {
  try {
    const isExist = fileUtils.fileIsExit(xmindOfflineTokenFilePath);
    if (!isExist) {
      log.error("xmindOfflineToken is not exist!");
      return;
    }
    const orgData = await fileUtils.readDataFromFile(xmindOfflineTokenFilePath);
    console.log(orgData);
    xmindOfflineToken = fileUtils.encryptRsaData(orgData);
  } catch (error) {
    log.error("init error:", error);
  }
};
initXmindOfflineToken()