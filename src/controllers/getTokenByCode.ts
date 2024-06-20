import { Context } from "hono";

interface ActivationCode {
  activation_time?: number;
}

// 获取指定的激活码
const getTokenByCode = async (c: Context) => {
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
    const activationCode: ActivationCode = activationCodes[0];
    return c.json({
      activation_time: activationCode.activation_time,
    });
  } catch (error) {
    c.notFound();
  }
};

export default getTokenByCode;
