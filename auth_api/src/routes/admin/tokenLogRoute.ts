import { Hono } from "hono";
import { tokenLogDelete, tokenLogList } from "../../controllers";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const tokenLogListValid = zValidator(
  "query",
  z
    .object({
      pageSize: z.coerce.number().optional(),
      currentPage: z.coerce.number().optional()
    })
    .refine((data) => {
      return data.pageSize !== undefined && data.currentPage !== undefined;
    }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json( {code: 400, message: messages.join(",")  });
    }
  }
);

const tokenLogDeleteValid = zValidator(
  "query",
  z.object({
    ids: z.string().refine(
      (value) => {
        // 检查是否为单个数字或逗号分隔的数字列表
        const regex = /^(\d+)(,\d+)*$/;
        return regex.test(value);
      },
      {
        message:
          "ids must be a single number or a comma-separated list of numbers"
      }
    )
  }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json( {code: 400, message: messages.join(",")  });
    }
  }
);
export const tokenLogRoute = new Hono();
tokenLogRoute.get("/", tokenLogListValid, tokenLogList);
tokenLogRoute.delete("/", tokenLogDeleteValid, tokenLogDelete);
