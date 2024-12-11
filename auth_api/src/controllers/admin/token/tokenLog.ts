import { Context } from "hono";
import page from "../../../utils/page";

export const tokenLogDelete = async (c: Context) => {
  try {
    const { ids } = c.req.query();
    const uniqueIds = [...new Set(ids.split(","))];
    const placeholders = uniqueIds.map(() => "?").join(",");
    const statement = `DELETE FROM tb_tklog WHERE id IN (${placeholders})`;
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

export const tokenLogList = async (c: Context) => {
  try {
    const query = c.req.query();
    let pageSize = Number(query.pageSize);
    let currentPage = Number(query.currentPage);

    const tokenLogPage = new page(c.env.DB, "tb_tklog");
    const total = await tokenLogPage.count();
    if (total / pageSize < currentPage) {
      currentPage = Math.ceil(total / pageSize);
    }

    const pageResult = await tokenLogPage.paginate(
      currentPage,
      pageSize,
      "addTime",
      "DESC"
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
