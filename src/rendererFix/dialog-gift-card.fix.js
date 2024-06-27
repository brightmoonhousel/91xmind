


handleRedeem: async () => {
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