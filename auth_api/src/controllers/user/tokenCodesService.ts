import { Context } from "hono";
import encryptData from "../../utils/encrypt";

// 获取授权信息
export const getAuthInfo = async (c: Context) => {
  try {
    const { deviceCode } = c.req.query();
    const deviceCodeInfo = await c.env.DB.prepare("SELECT * FROM tb_auth WHERE deviceCode = ?")
      .bind(deviceCode)
      .first();
    if (!deviceCodeInfo || deviceCodeInfo.isBanned) {
      return c.json({
        code: 400,
        message: "设备码无效或封禁"
      });
    }
    // 判断是否过期
    const nowTime = new Date().getTime();
    if (nowTime > deviceCodeInfo.expiryTime) {
      return c.json({
        code: 400,
        message: "授权码已过期"
      });
    }
    const submsg = `{"status": "sub", "expireTime": ${deviceCodeInfo.expiryTime}, "ss": "", "deviceId": "${deviceCode}"}`;
    const encryptedData = encryptData(submsg, "9504867335124261");

    return c.json({
      code: 200,
      message: "success",
      raw_data: encryptedData
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`
    });
  }
};

// 验证授权码
export const verificationCode = async (c: Context) => {
  try {
    const { tokenCode } = await c.req.json();
    const tokenCodesInfo = await c.env.DB.prepare(`SELECT * FROM tb_token WHERE  tokenCode = ?`)
      .bind(tokenCode)
      .first();
    if (!tokenCodesInfo) {
      return c.json({
        code: 400,
        message: "授权码无效"
      });
    }
    const { days } = tokenCodesInfo;

    return c.json({
      code: 200,
      message: "success",
      desc: days == -1 ? "永久订阅" : `${days} 天`
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`
    });
  }
};

// 使用授权码
export const usedCode = async (c: Context) => {
  try {
    const { deviceCode, tokenCode } = await c.req.json();
    // 获取授权码信息
    const tokenCodesInfo = await c.env.DB.prepare(`SELECT * FROM tb_token WHERE  tokenCode = ?`)
      .bind(tokenCode)
      .first();

    if (!tokenCodesInfo) {
      return c.json({
        code: 400,
        message: "授权码已使用或不存在"
      });
    }
    const { id, days } = tokenCodesInfo;
    const usedTime = new Date().getTime();
    const expiryTime = days == -1 ? 4070880000000 : usedTime + days * 24 * 60 * 60 * 1000;

    //判断用户是否存在
    const deviceCodeInfo = await c.env.DB.prepare("SELECT * FROM tb_auth WHERE deviceCode = ?")
      .bind(deviceCode)
      .first();

    if (deviceCodeInfo?.id) {
      //更新用户授权信息
      await c.env.DB.prepare(
        "UPDATE tb_auth SET deviceCode = ?1 ,tokenCode= ?2 ,expiryTime = ?3 , isBanned = ?4 WHERE id = ?5"
      )
        .bind(deviceCode, tokenCode, expiryTime, 0, deviceCodeInfo.id)
        .run();
    } else {
      //添加用户授权信息
      await c.env.DB.prepare(
        "INSERT INTO tb_auth (deviceCode, tokenCode, usedTime, expiryTime, isBanned) VALUES (?1, ?2, ?3, ?4, ?5)"
      )
        .bind(deviceCode, tokenCode, usedTime, expiryTime, 0)
        .run();
    }

    //删除被使用了的授权码
    //如果是管理员激活码则不删除000000-000000-000000-000000
    if (tokenCode != "000000-000000-000000-000000") {
      await c.env.DB.prepare(`DELETE FROM tb_token WHERE id = ?`).bind(id).run();
    }

    const submsg = `{"status": "sub", "expireTime": ${expiryTime}, "ss": "", "deviceId": "${deviceCode}"}`;
    const encryptedData = encryptData(submsg, "9504867335124261");

    return c.json({
      code: 200,
      message: "success",
      raw_data: encryptedData
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`
    });
  }
};
//解绑授权码
export const unBind = async (c: Context) => {
  const { unbindCode } = await c.req.json();
  // 获取绑定信息
  const authInfo = await c.env.DB.prepare(`SELECT * FROM tb_auth WHERE  tokenCode = ?`)
    .bind(unbindCode)
    .first();
  if (!authInfo) {
    return c.json({
      code: 400,
      message: "授权码不存在或已经解绑"
    });
  }
  //授权码入库
  let day = authInfo.expiryTime - Date.now();
  if (day < 0) {
    day = 0; // 如果到期时间已经过去，返回0天
  }
  day = Math.ceil(day / 86400000); // 转换为天数并向上取整
  if (day >= 4000) {
    day = -1;
  }
  await c.env.DB.prepare("INSERT INTO tb_token (tokenCode, days) VALUES (?1, ?2)")
    .bind(unbindCode, day)
    .run();
  //删除旧授权信息
  await c.env.DB.prepare(`DELETE FROM tb_auth WHERE tokenCode = ?`).bind(unbindCode).run();
  return c.json({
    code: 200,
    message: "解绑成功"
  });
};
