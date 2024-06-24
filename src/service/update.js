
/*-------------------------------------------------*/
// windows自动更新
function updateXmind() {
    const winAppData = process.env.APPDATA;
    if (!winAppData) {
      log.error("LOCALAPPDATA environment variable is not set.");
      return;
    }
    const updatePath = _path.join(winAppData, "Xmind", "xmindUpdate.exe");
    log.info("update path:", updatePath);
    const exists = fs.existsSync(updatePath);
    if (!exists) {
      log.error("Update executable not found.");
      return;
    }
    log.info("Begin update");
    exec(updatePath, (error) => {
      if (error) {
        log.error(`Error executing update: ${error.message}`);
      } else {
        log.info("Update executed successfully.");
      }
    });
  }
  if (platform == "win32") {
    (async () => {
      const fetcher = new FetchData();
      const resMy = await fetcher.fetch("https://xmind.aifake.xyz");
      const resXmind = await fetcher.fetch(
        "https://www.xmind.cn/xmind/update/latest-win64.yml"
      );
      const nowAppVersion = app.getVersion();
      const myLatestVersion = (await resMy.json()).version;
      const xmindLatestVersion = yaml.load(await resXmind.text()).version;
      log.info("check update...");
      try {
        if (xmindLatestVersion > nowAppVersion) {
          log.info(`New version ${xmindLatestVersion} is available.`);
          log.info("my latest version:", myLatestVersion);
          if (xmindLatestVersion <= myLatestVersion) {
            log.info("allow update ");
            app.once("before-quit", () => {
              updateXmind();
            });
          } else {
            log.info("disallow update");
          }
        } else {
          log.info(`Current version ${nowAppVersion} is the latest.`);
        }
      } catch (error) {
        log.error("check update error:", error);
      }
    })();
  }