import { Context } from "hono";
import encryptData from "../../utils/encrypt";

// 获取收取信息
export const getAuthInfo = async (c: Context) => {
  try {
    const { deviceCode } = c.req.query();
    const deviceCodeInfo = await c.env.DB.prepare(
      "SELECT * FROM tb_auth WHERE deviceCode = ?"
    )
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
    console.log(submsg);
    const encryptedData = encryptData(submsg,"1234567890123456");
  
    console.log(encryptedData);
    return c.json({
      code: 200,
      message: "success",
      data: {
        raw_data: encryptedData,
        license: {
          status: "sub",
          expireTime: deviceCodeInfo.expiryTime
        }
      }
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
    const tokenCodesInfo = await c.env.DB.prepare(
      `SELECT * FROM tb_token WHERE  tokenCode = ?`
    )
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
      data: { desc: days == -1 ? "永久订阅" : `${days} 天` }
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
    const tokenCodesInfo = await c.env.DB.prepare(
      `SELECT * FROM tb_token WHERE  tokenCode = ?`
    )
      .bind(tokenCode)
      .first();

    if (!tokenCodesInfo) {
      return c.json({
        code: 400,
        message: "授权码不存在"
      });
    }
    const { id, days } = tokenCodesInfo;
    const usedTime = new Date().getTime();
    const expiryTime =
      days == -1 ? 4070880000000 : usedTime + days * 24 * 60 * 60 * 1000;

    //判断用户是否存在
    const deviceCodeInfo = await c.env.DB.prepare(
      "SELECT * FROM tb_auth WHERE deviceCode = ?"
    )
      .bind(deviceCode)
      .first();

    if (deviceCodeInfo.id) {
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
    await c.env.DB.prepare(`DELETE FROM tb_token WHERE id = ?`).bind(id).run();
    return c.json({
      code: 200,
      message: "success"
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`
    });
  }
};
