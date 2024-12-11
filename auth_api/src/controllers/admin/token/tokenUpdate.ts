import { Context } from "hono";

// 获取指定的激活码
export const tokenUpdate = async (c: Context) => {
  try {
    const { id, tokenCode, days } = await c.req.json();

    await c.env.DB.prepare(
      "UPDATE tb_token SET tokenCode = ?1, days = ?2 WHERE id = ?3"
    )
      .bind(tokenCode, days, id)
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
