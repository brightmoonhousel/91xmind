import { Context } from "hono";
import page from "../../../utils/page";

// 获取指定的激活码
export const authList = async (c: Context) => {
  try {
    const query = c.req.query();
    let pageSize = Number(query.pageSize);
    let currentPage = Number(query.currentPage);
    const tokenCode = query.tokenCode as string;
    const deviceCode = query.deviceCode as string;

    const tokenPage = new page(c.env.DB, "tb_auth");
    const total = await tokenPage.count();
    if (total / pageSize < currentPage) {
      currentPage = Math.ceil(total / pageSize);
    }

    const pageResult = await tokenPage.paginate(
      currentPage,
      pageSize,
      ["tokenCode = ?", "deviceCode = ?"],
      [tokenCode, deviceCode],
      "id",
      "desc"
    );
    return c.json({
      code: 200,
      message: "请求成功",
      total: total,
      rows: pageResult
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: `${error}`
    });
  }
};
