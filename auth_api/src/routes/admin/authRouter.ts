import { Hono } from "hono";
import { authAdd, authList, authDelete, authUpdate } from "../../controllers";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const authAddValid = zValidator(
  "json",
  z.object({
    id: z.coerce.number().optional(),
    deviceCode: z.coerce.string().min(10).max(40),
    tokenCode: z.coerce.string().min(1).max(30),
    expiryTime: z.coerce.number().min(1),
    isBanned: z.coerce.boolean()
  }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json( {code: 400, message: messages.join(",")  });
    }
  }
);

const authDeleteValid = zValidator(
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

const authListValid = zValidator(
  "query",
  z
    .object({
      pageSize: z.coerce.number().optional(),
      currentPage: z.coerce.number().optional(),
      tokenCode: z.string().optional(),
      deviceCode: z.string().optional()
    })
    .refine((data) => {
      return (
        (data.pageSize !== undefined && data.currentPage !== undefined) ||
        data.tokenCode !== undefined || data.deviceCode !== undefined
      );
    }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json( {code: 400, message: messages.join(",")  });
    }
  }
);

export const authRoutes = new Hono();
authRoutes.get("/", authListValid, authList);
authRoutes.delete("/", authDeleteValid, authDelete);
authRoutes.post("/", authAddValid, authAdd);
authRoutes.put("/", authAddValid, authUpdate);
