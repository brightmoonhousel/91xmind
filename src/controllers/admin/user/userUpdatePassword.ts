import { Context } from "hono";

export const userUpdatePassword = async (c: Context) => {
  try {
    const { old_pwd, new_pwd } = await c.req.json();
    const { username } = c.get("jwtPayload");
    // 检查用户是否存在并验证旧密码
    const { results: existingUsers } = await c.env.DB.prepare(
      "SELECT * FROM tb_admin WHERE username = ? AND password = ?"
    )
      .bind(username, old_pwd)
      .all();

    if (existingUsers.length === 0) {
      return c.json({
        code: 402,
        message: "原密码错误"
      });
    }

    // 更新密码
    await c.env.DB.prepare(
      "UPDATE tb_admin SET password = ? WHERE username = ?"
    )
      .bind(new_pwd, username)
      .run();

    return c.json({
      code: 200,
      message: "密码修改成功"
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`,
    });
  }
};
