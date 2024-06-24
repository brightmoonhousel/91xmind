import { Context } from "hono";

export const userRegister = async (c: Context) => {
  try {
    const { username, password } = await c.req.json();
    // 检查用户名是否已存在
    const { results: existingUsers } = await c.env.DB.prepare(
      "SELECT * FROM tb_admin WHERE username = ?"
    )
      .bind(username)
      .all();

    if (existingUsers.length > 0) {
      return c.json({
        code: 402,
        message: "用户名已存在"
      });
    }

    // 插入新用户
    await c.env.DB.prepare(
      "INSERT INTO tb_admin (username, password) VALUES (?1, ?2)"
    )
      .bind(username, password)
      .run();

    return c.json({
      code: 201,
      message: "注册成功"
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`,
    });
  }
};

