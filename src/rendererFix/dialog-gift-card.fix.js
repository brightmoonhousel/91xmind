handleRedeem: async () => {
  const a = abc;
  try {
    //传递机器码
    await a.fetch("POST /xos/devices");
    await a.fetch("POST /xos/redeem-sub");
    const res = await a.fetch("POST /xos/devices");
    await a.fetch("POST /pinia/store/mutations", {
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
    }, 0);
    a.fetch("POST /windows", {
      name: "dialog-congratulate"
    });
  } catch (e) {}
}