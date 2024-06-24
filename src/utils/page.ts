class Paginator<T> {
  private db: any;
  private tableName: string;
  /**
   *
   * @param db Database connection object
   * @param tableName Table name to be paginated
   */
  constructor(db: any, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  /**
   *
   * @param currentPage
   * @param pageSize
   */
  async paginate(currentPage: number, pageSize: number): Promise<T>;
  async paginate(
    currentPage: number,
    pageSize: number,
    conditions: string[],
    params: string[]
  ): Promise<T>;
  async paginate(
    currentPage: number,
    pageSize: number,
    orderBy: string,
    order: string
  ): Promise<T>;
  async paginate(
    currentPage: number,
    pageSize: number,
    conditions: string[],
    params: string[],
    orderBy: string,
    order: string
  ): Promise<T>;
  async paginate(
    currentPage: number = 1,
    pageSize: number = 1,
    conditionsOrOrderBy: string[] | string = [],
    paramsOrOrder: any[] | string = [],
    orderBy: string = "id",
    order: string = "DESC"
  ): Promise<T> {
    try {
      currentPage = currentPage ? currentPage : 1;
      pageSize = pageSize ? pageSize : 1;

      const offset = (currentPage - 1) * pageSize;
      let conditionString = "1=1";

      let conditions: string[] = [];
      let params: any[] = [];

      if (Array.isArray(conditionsOrOrderBy)) {
        conditions = conditionsOrOrderBy;
        params = paramsOrOrder as any[];
      } else {
        orderBy = conditionsOrOrderBy as string;
        order = paramsOrOrder as string;
      }

      if (conditions || params) {
        if (conditions.length === 0 && params.length !== 0)
          throw new Error("conditions is empty but params is not empty");
        if (conditions.length !== params.length)
          throw new Error("conditions and params must have the same length");
      }

      const p = [];
      for (let i = 0; i < conditions.length; i++) {
        p.push([params[i], conditions[i]]);
      }
      const filtered = p.filter(
        ([param, condition]) =>
          param !== undefined &&
          param !== "" &&
          condition !== undefined &&
          condition !== ""
      );

      const conditionsArray = filtered.map((item) => item[1]);
      const paramsArray = filtered.map((item) => item[0]);

      // 假设conditions的类型是string[]
      if (conditionsArray.length > 0) {
        conditionString = conditionsArray.join(" AND ");
      }

      if (order.toUpperCase() !== "DESC" && order.toUpperCase() !== "ASC") {
        throw new Error("order must be DESC or ASC");
      }

      if (orderBy) {
        orderBy = `ORDER BY ${orderBy} ${order}`;
      } else {
        orderBy = "";
      }

      // 获取数据行，并按照指定的顺序排序
      const sql = this.db
        .prepare(
          `SELECT * FROM ${this.tableName} WHERE ${conditionString} ${orderBy} LIMIT ? OFFSET ?`
        )
        .bind(...paramsArray, pageSize, offset);
      // console.log(sql);
      const { results: rows } = await sql.all();
      return rows;
    } catch (error) {
      throw error;
    }
  }
  async count(): Promise<number> {
    try {
      const sql = this.db.prepare(
        `SELECT COUNT(*) AS total FROM ${this.tableName}`
      );
      const total = await sql.first("total");
      // console.log(sql);
      return total;
    } catch (error) {
      throw error;
    }
  }
}

export default Paginator;
