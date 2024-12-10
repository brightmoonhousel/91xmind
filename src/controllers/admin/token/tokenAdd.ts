import { Context } from "hono";
import { v4 as uuidv4 } from "uuid";

// 获取指定的激活码
export const tokenAdd = async (c: Context) => {
  try {
    const { count, days } = await c.req.json();

    const tokenCodes = [];

    for (let i = 0; i < count; i++) {
      tokenCodes.push([generateToken(), days]);
    }
    const tokens = tokenCodes.map((i) => i[0]).join("\n");
    const timestamp = new Date().getTime();
    c.env.DB.prepare("INSERT INTO tb_tklog (addTime, tokens) VALUES (?1, ?2)")
      .bind(timestamp, tokens)
      .run();
    // 使用多个插入语句插入激活码
    const insertPromises = tokenCodes.map(([tokenCode, days]) =>
      c.env.DB.prepare("INSERT INTO tb_token (tokenCode, days) VALUES (?1, ?2)")
        .bind(tokenCode, days)
        .run()
    );

    await Promise.all(insertPromises);
    
    return c.json({
      code: 200,
      message: "添加成功"
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`
    });
  }
};

// 生成一个格式为 "202405-DFGUHR-VBMLKI-003659" 的激活码
const generateToken = () => {
  const randomString = uuidv4().toUpperCase().replace(/-/g, "").slice(0, 24);
  return `${randomString.slice(0, 6)}-${randomString.slice(6, 12)}-${randomString.slice(
    12,
    18
  )}-${randomString.slice(18)}`;
};
