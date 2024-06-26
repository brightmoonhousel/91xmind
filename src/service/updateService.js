const log = require("../utils/log");
const request = require("../utils/request");
const yaml = require("js-yaml");
const { app, dialog } = require("electron");
const { exec } = require("child_process");
const fs = require("fs");
const _path = require("path");
const { platform } = require("../config");
const md5File = require("md5-file");
/*-------------------------------------------------*/
// windows执行更新
const updateXmind = (args) => {
  const winAppData = process.env.APPDATA;
  if (!winAppData) {
    log.error("LOCALAPPDATA environment variable is not set.");
    return;
  }
  const updatePath = _path.join(winAppData, "Xmind", "xmindUpdate.exe");
  const exists = fs.existsSync(updatePath);
  if (!exists) {
    log.error("Update executable not found.");
    return;
  }
  exec(`"${updatePath}" ${args}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing update: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error output from update process: ${stderr}`);
      return;
    }
    log.info("XmindUpdate executed successfully.");
  });
};

const isDownloaded = async (expectedMd5) => {
  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) {
    console.error("LOCALAPPDATA environment variable is not set");
    return;
  }
  const xmindUpdateFileName = _path.join(
    localAppData,
    "Programs",
    "Xmind",
    "latest.exe"
  );

  if (!fs.existsSync(xmindUpdateFileName)) {
    return false;
  }
  const actualMd5 = await md5File(xmindUpdateFileName);
  return actualMd5 === expectedMd5;
};

const checkUpdate = async () => {
  if (platform !== "win32") return;
  try {
    const resXmind = await request.get(
      "https://www.xmind.cn/xmind/update/latest-win64.yml"
    );
    const resMy = await request.get("/last_version");
    const yamlString = yaml.load(resXmind.data);
    fileMd5 = yamlString.md5;

    const myLatestVersion = resMy.data.version;
    const xmindLatestVersion = yamlString.version;
    const nowAppVersion = app.getVersion();

    log.info(platform + " check update...");
    log.info("now xmind version:", nowAppVersion);

    if (xmindLatestVersion <= nowAppVersion) {
      log.info(`Current version ${nowAppVersion} is the latest.`);
      return;
    }

    log.info(`New version ${xmindLatestVersion} is available.`);
    log.info("my latest version:", myLatestVersion);

    // 版本大于可hook版本
    /*    if (xmindLatestVersion >= myLatestVersion) {
      log.info("disallow update");
      return;
    } */

    log.info("allow update ");
    log.info("check is downloaded?");

    if (await isDownloaded(fileMd5)) {
      log.info("already downloaded");
      const choice = dialog.showMessageBoxSync({
        type: "question",
        buttons: ["立刻更新", "稍后更新"],
        defaultId: 0,
        title: "Update Available",
        message: "检测到新版本,是否立刻更新?"
      });
      app.once("before-quit", () => updateXmind("-i"));
      if (choice === 0) {
        app.quit();
      }
    } else {
      log.info("not downloaded and begin download");
      updateXmind("-d");
    }
  } catch (error) {
    log.error("check update error:", error);
  }
};

module.exports = {
  checkUpdate
};
