const { ipcRenderer } = require("electron");
let seq = 0;
async function sendIPCRequest(event, payload = {}) {
  return new Promise((resolve, reject) => {
    const replyEvent = `ipc-api-reply:${event}:${seq}`;
    const replyCallback = (event, { error, data }) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    };
    ipcRenderer.once(replyEvent, replyCallback);
    ipcRenderer.send(`ipc-api:${event}`, { payload, seq });
    seq++;
  });
}

const log = {
  info: function (msg, ...args) {
    const logEntry = {
      moduleName: "hook-Dialog",
      timestamp: new Date().toISOString(),
      level: "info",
      message: "\x1b[92m" + msg,
      args: args
    };
    ipcRenderer.send("logger:handleLogEvent", logEntry);
  },
  error: function (moduleName, ...args) {
    const logEntry = {
      moduleName: "hook-Dialog",
      timestamp: new Date().toISOString(),
      level: "error",
      message: msg,
      args: args
    };
    ipcRenderer.send("logger:handleLogEvent", logEntry);
  }
};
const querystring = require("querystring");
(async () => {
  const parseQueryString = (str) => {
    const queryString = str.startsWith("?") ? str.slice(1) : str;
    return querystring.parse(queryString);
  };
  const title = parseQueryString(window.location.search);
  try {
    const res = await sendIPCRequest("POST /xos/devices");
    log.info("Bind device result:", res);
    const username = res.license?.device_name || "Xmind pro" ;
    const isSub = res.license?.status;
    const userInfo = {
      region: "cn",
      user: username,
      token: "fuckAlibaba",
      uid: "fuckTencent",
      primaryEmail: username,
      fullname: username,
      groupName: "",
      phone: "13000000000"
    };
    log.info("User Info:", userInfo);
    const updatedUserInfo = {
      ...userInfo,
      rawSubscriptionData: res.rawData
    };
    // Update account and notify success
    await sendIPCRequest("POST /pinia/store/mutations", {
      mutations: [
        {
          id: "account",
          type: "updateAccount",
          payload: [updatedUserInfo]
        }
      ]
    });
    log.info("updateAccount success");

    // Close the window after a brief delay
    setTimeout(() => {
      if (window) {
        window.close();
      }
    }, 0);

    if (title.ignoreOpenDialog) {
      return;
    }
    if (title.openBy) {
      await sendIPCRequest("POST /windows", { name: title.openBy });
      return;
    }
    if (isSub == "sub") {
      await sendIPCRequest("POST /windows", {
        name: "dialog-congratulate"
      });
    }
  } catch (error) {
    log.error("An error occurred in  singnin ", error);
  }
})();
