import { Context } from "hono";
import { sign } from "hono/jwt";

export const userLogin = async (c: Context) => {
  try {
    const { username, password } = await c.req.json();
    // 执行 SQL 查询
    const users = await c.env.DB.prepare(
      "SELECT * FROM tb_admin WHERE username = ? AND password = ?"
    )
      .bind(username, password)
      .first();

    if (!users) {
      return c.json({
        code: 402,
        message: "用户名或密码错误"
      });
    }

    const payload = {
      userId: users.id,
      username: users.username,
      exp: Math.floor(Date.now() / 1000) + 60 * c.env.JWT_EXP
    };
    const secret = c.env.JWT_SECRET;
    const token = await sign(payload, secret);

    return c.json({
      code: 200,
      message: "登录成功",
      token: `Token ${token}`
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`,
    });
  }
};
