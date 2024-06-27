const _path = require("path");
const log = require("../utils/logUtils");
const USER_HOME = process.env.HOME || process.env.USERPROFILE;
const xmindOfflineTokenFilePath = _path.join(USER_HOME, "xmindOfflineToken");
const fileUtils = require("../utils/fileUtils");

//初始化函数
const initXmindOfflineToken = async () => {
  try {
    const isExist = fileUtils.fileIsExit(xmindOfflineTokenFilePath);
    if (!isExist) {
      log.error("xmindOfflineToken is not exist!");
      return;
    }
    const encData = await fileUtils.readDataFromFile(xmindOfflineTokenFilePath);
    const decDate = fileUtils.decryptAesData(encData);
    log.info("本地激活码加载成功:", decDate);
    return decDate;
  } catch (error) {
    log.error("init xmindOfflineToken error:", error);
  }
};

//更新本地订阅,防止跑路订阅丢失
const updateXmindOfflineToken = async (data) => {
  try {
    await fileUtils.saveDataToFile(xmindOfflineTokenFilePath, data);
  } catch (error) {
    log.error("updateXmindOfflineToken error", error);
  }
};

module.exports = {
  initXmindOfflineToken,
  updateXmindOfflineToken
};
