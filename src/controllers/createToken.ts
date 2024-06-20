import { Context } from "hono";
import { v4 as uuidv4 } from "uuid";

interface CreateActivationCodeRequest {
  activation_time?: number;


  
}

// 增
const createActivationCode = async (c: Context) => {
  try {
    // 获取请求参数
    const { activation_time }: CreateActivationCodeRequest = await c.req.json();
    const count = parseInt(c.req.query("count") || "1", 10);
    // 创建一个存储生成激活码和激活时间的数组
    const activationCodes = [];
    const currentTime = activation_time || Date.now();

    for (let i = 0; i < count; i++) {
      const token = generateToken();

      activationCodes.push([token, currentTime]);
    }

    // 使用多个插入语句插入激活码
    const insertPromises = activationCodes.map(([token, time]) =>
      c.env.DB.prepare(
        "INSERT INTO activation_codes (token, activation_time) VALUES (?, ?)"
      )
        .bind(token, time)
        .run()
    );

    const results = await Promise.all(insertPromises);
    const success = results.every((result) => result.success);

    if (!success) {
      return c.json(
        {
          success: false,
          message: "Error while adding new activation codes"
        },
        { status: 500 }
      );
    }

    let tokens = activationCodes.map((code) => code[0]);
    // 直接返回纯文本内容
    return c.text(currentTime + "\n" + tokens.join("\n"));
  } catch (error) {
    console.error(error);
    return c.json({
      success: false,
      message: "Error while adding new activation codes"
    });
  }
};

// 生成一个格式为 "202405-DFGUHR-VBMLKI-003659" 的激活码
const generateToken = () => {
  const randomString = uuidv4().toUpperCase().replace(/-/g, "").slice(0, 24);
  return `${randomString.slice(0, 6)}-${randomString.slice(
    6,
    12
  )}-${randomString.slice(12, 18)}-${randomString.slice(18)}`;
};

export default createActivationCode;
