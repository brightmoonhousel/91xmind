import { Context } from "hono";

// 删除指定的激活码
const deleteTokenByCode = async (c: Context) => {
  try {
    const code = c.req.query("code");

    if (!code || code.length !== 27) {
      return c.notFound();
    }

    const { results: activationCodes } = await c.env.DB.prepare(
      "SELECT * FROM activation_codes WHERE token = ?"
    )
      .bind(code)
      .all();

    if (activationCodes.length === 0) {
      return c.notFound();
    }

    const deleteResult = await c.env.DB.prepare(
      "DELETE FROM activation_codes WHERE token = ?"
    )
      .bind(code)
      .run();

    if (deleteResult.success) {
      return c.body(null, 204, {});
    } else {
      return c.notFound();
    }
  } catch (error) {
    c.notFound();
  }
};

export default deleteTokenByCode;
