import { Context } from "hono";

// 删除指定的激活码
export const tokenDelete = async (c: Context) => {
  try {
    const { ids } = c.req.query();
    const uniqueIds = [...new Set(ids.split(","))];
    const placeholders = uniqueIds.map(() => "?").join(",");
    const statement = `DELETE FROM tb_token WHERE id IN (${placeholders})`;
    await c.env.DB.prepare(statement)
      .bind(...uniqueIds)
      .run();

    return c.json({
      code: 200,
      message: "删除成功"
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`
    });
  }
};
