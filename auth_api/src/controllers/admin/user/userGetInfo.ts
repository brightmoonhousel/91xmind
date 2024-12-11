import { Context } from "hono";

export const userGetInfo = async (c: Context) => {
  try {
    const { username } = c.get("jwtPayload");
    // 检查用户是否存在并验证旧密码
    const userInfo = await c.env.DB.prepare(
      "SELECT * FROM tb_admin WHERE username = ? "
    )
      .bind(username)
      .first();

    if (!userInfo) {
      return c.json({
        code: 402,
        message: "用户不存在"
      });
    }

    return c.json({
      code: 200,
      message: "请求成功",
      id: userInfo.id,
      username: userInfo.username,
      extra_info: userInfo.extra_info
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`
    });
  }
};
