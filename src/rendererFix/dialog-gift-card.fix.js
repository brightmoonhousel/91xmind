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
async function hook() {
  try {
    //传递机器码
    await sendIPCRequest("POST /xos/devices");
    await sendIPCRequest("POST /xos/redeem-sub");
    const res = await sendIPCRequest("POST /xos/devices");
    await sendIPCRequest("POST /pinia/store/mutations", {
      mutations: [
        {
          id: "account",
          type: "updateAccount",
          payload: [{ rawSubscriptionData: res.rawData }]
        }
      ]
    });
    setTimeout(() => {
      if (window) {
        window.close();
      }
    }, 200);
    sendIPCRequest("POST /windows", {
      name: "dialog-congratulate"
    });
  } catch (e) {}
}