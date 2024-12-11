import { Hono } from "hono";
import {
  tokenList,
  tokenAdd,
  tokenUpdate,
  tokenDelete
} from "../../controllers";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const tokenListValid = zValidator(
  "query",
  z
    .object({
      pageSize: z.coerce.number().optional(),
      currentPage: z.coerce.number().optional(),
      tokenCode: z.string().optional()
    })
    .refine((data) => {
      return (
        (data.pageSize !== undefined && data.currentPage !== undefined) ||
        data.tokenCode !== undefined
      );
    }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json( {code: 400, message: messages.join(",")  });
    }
  }
);
const tokenUpdateValid = zValidator(
  "json",
  z.object({
    tokenCode: z.string().min(3).max(30),
    days: z.coerce.number().min(-1).max(3650),
    id: z.coerce.number().min(1)
  }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json( {code: 400, message: messages.join(",")  });
    }
  }
);
const tokenDeleteValid = zValidator(
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
const tokenAddValid = zValidator(
  "json",
  z.object({
    count: z.coerce.number().min(1).max(100),
    days: z.coerce.number().min(-1).max(3650),
  }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json( {code: 400, message: messages.join(",")  });
    }
  }
);
export const tokenRoute = new Hono();
tokenRoute.get("/", tokenListValid, tokenList);
tokenRoute.delete("/", tokenDeleteValid, tokenDelete);
tokenRoute.post("/", tokenAddValid, tokenAdd);
tokenRoute.put("/", tokenUpdateValid, tokenUpdate);
