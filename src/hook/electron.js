const electron = require("electron");
const { hostInfo } = require("../config");

electron.app.commandLine.appendSwitch("--ignore-certificate-errors", "true");
const originalElectronRequest = electron.net.request;
const fakeUrl = `https://${hostInfo.name}:${hostInfo.httpsPort}`;
electron.net.request = (options, callback) => {
  let url = options.url;
  if (url.startsWith("https://www.xmind.cn")) {
    url = url.replace("https://www.xmind.cn", fakeUrl);
  }
  options.url = url;
  options.rejectUnauthorized = false;
  return originalElectronRequest.call(this, options, callback);
};
module.exports = electron;
