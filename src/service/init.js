const _path = require("path");
const log = require("../utils/log");
const USER_HOME = process.env.HOME || process.env.USERPROFILE;
const xmindOfflineTokenFilePath = _path.join(USER_HOME, "xmindOfflineToken");
const fileUtils = require("../utils/otherUtils");


//初始化函数
const initXmindOfflineToken = async () => {
  try {
    const isExist = fileUtils.fileIsExit(xmindOfflineTokenFilePath);
    if (!isExist) {
      log.error("xmindOfflineToken is not exist!");
      return;
    }
    const orgData = await fileUtils.readDataFromFile(xmindOfflineTokenFilePath);
    return fileUtils.decryptAesData(orgData);
  } catch (error) {
    log.error("init error:", error);
  }
};

//更新本地订阅,防止失联
const updateXmindOfflineToken = async (data) => {
  try {
    await fileUtils.saveDataToFile(xmindOfflineTokenFilePath, fileUtils.encryptAesData(data));
    log.info(`updateXmindOfflineToken success`);
  } catch (error) {
    log.error("updateXmindOfflineToken error", error);
  }
};

module.exports = {
  initXmindOfflineToken,
  updateXmindOfflineToken
};
