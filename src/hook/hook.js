/*-------------------------------------------------*/
//crypto hook
const originalPublicDecrypt = crypto.publicDecrypt;
crypto.publicDecrypt = function (options, buffer) {
  try {
    options.key = `-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDELel8VBfyRQowc9b1Lfi4LMjB\n7i0w9cvWMWJQesLcrEoIKwVvgp4tX4zQ97BmnoC5lGDrBLPC/EgcXjmz2Vu/94FQ\n0VaLjAhnJeyinaW5wNZrKm391eb6fjnX7/cjOe8/pb8HklmPfsshgTpw/PE1gJ6b\ncg7UybMtyPn2pTuCrQIDAQAB\n-----END PUBLIC KEY-----`;
    return originalPublicDecrypt.call(this, options, buffer);
  } catch (e) {
    return originalPublicDecrypt.call(this, options, buffer);
  }
};
/*-------------------------------------------------*/
//electron hook
const originalElectronRequest = electron.net.request;
const fakeUrl = `https://${Host.name}:${Host.httpsPort}`;
electron.net.request = function (options, callback) {
  let url = options.url;
  if (url.startsWith("https://www.xmind.cn")) {
    url = url.replace("https://www.xmind.cn", fakeUrl);
  }
  options.url = url;
  options.rejectUnauthorized = false;
  return originalElectronRequest.call(this, options, callback);
};
/*-------------------------------------------------*/
//https hook
const originalHttpsRequest = https.request;
https.request = function (urlOrOptions, optionsOrCallback, callback) {
  let url, options, cb;
  if (typeof urlOrOptions === "string" || urlOrOptions instanceof URL) {
    url = urlOrOptions;
    options = optionsOrCallback;
    cb = callback;
  } else {
    options = urlOrOptions;
    cb = optionsOrCallback;
  }

  if (
    options?.pathname == "/xmind/update/latest-win64.yml" ||
    options?.pathname == "/xmind/update/latest-mac.json"
  ) {
    const updateUrl = {
      darwin: "/xmind/update/latest-mac.json",
      win32: "/xmind/update/latest-win64.yml",
      linux: "linux"
    }[platform];
    options = {
      protocol: "https:",
      host: Host.name,
      port: Host.httpsPort,
      hostname: Host.name,
      path: updateUrl,
      method: "GET",
      headers: {
        Accept: "*/*",
        "User-Agent": "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)",
        "Accept-Encoding": "gzip,deflate",
        Connection: "close"
      },
      rejectUnauthorized: false // 忽略证书验证
    };
  }
  return originalHttpsRequest.call(
    this,
    ...(url ? [url, options] : [options]),
    callback
  );
};


