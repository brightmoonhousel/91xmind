import { Hono } from "hono";
import { unBind } from "../../controllers";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
//验证器
const usedCodeValid = zValidator(
  "json",
  z.object({
    unbindCode: z.string().min(27).max(27)
  }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json({ code: 400, message: messages.join(",") });
    }
  }
);
export const unBindRouter = new Hono();
unBindRouter.post("/", usedCodeValid, unBind);
