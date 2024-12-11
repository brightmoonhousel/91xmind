import { Context } from "hono";

// 获取指定的激活码
export const authUpdate = async (c: Context) => {
  try {
    let { id, deviceCode, tokenCode, expiryTime, isBanned } =
      await c.req.json();
    isBanned = isBanned ? isBanned : 0;

    await c.env.DB.prepare(
      "UPDATE tb_auth SET deviceCode = ?1 ,tokenCode= ?2 ,expiryTime = ?3 , isBanned = ?4 WHERE id = ?5"
    )
      .bind(deviceCode, tokenCode, expiryTime, isBanned, id)
      .run();

    return c.json({
      code: 200,
      message: "编辑成功"
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`
    });
  }
};
