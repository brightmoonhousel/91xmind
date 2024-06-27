const fuckServer = require('../utils/fuckServer')
const httpsServer= new fuckServer()
httpsServer.get("/_res/session", async (req, res) => {
    return {
      uid: "_xmind_1234567890",
      group_name: "",
      phone: "1234567890123",
      group_logo: "",
      user: "_xmind_1234567890",
      cloud_site: "cn",
      expireDate: 1700000000000,
      emailhash: "1234567890",
      userid: 1234567890,
      if_cxm: 0,
      _code: 200,
      token: "1234567890",
      limit: 0,
      primary_email: "",
      fullname: "",
      type: null
    };
  });
  httpsServer.start(8080,'127.0.0.1')