const request = require("../utils/request");
const axios = require("axios");
(async () => {
  const resData = await axios({
    method: 'post',
    url: "https://xmind.aifake.xyz/api/v2/listen",
    data: {
      tokenCode: "BC4CE2-F9D475-4A2CAE-92273F"
    }
  });
  console.info(resData);
})();

