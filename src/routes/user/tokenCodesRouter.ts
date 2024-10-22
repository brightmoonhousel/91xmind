import { Hono } from "hono";
import { verificationCode, usedCode, getAuthInfo } from "../../controllers";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
//验证器
const verificationCodeValid = zValidator(
  "json",
  z.object({
    tokenCode: z.string().min(27).max(27)
  }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json({ code: 400, message: messages.join(",") });
    }
  }
);

const usedCodeValid = zValidator(
  "json",
  z.object({
    tokenCode: z.string().min(27).max(27),
    deviceCode: z.string().min(1)
  }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json({ code: 400, message: messages.join(",") });
    }
  }
);

const getAuthInfoValid = zValidator(
  "query",
  z.object({
    deviceCode: z.string().min(1)
  }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json({ code: 400, message: messages.join(",") });
    }
  }
);
export const tokenCodesRouter = new Hono();
tokenCodesRouter.post("/", verificationCodeValid, verificationCode);
tokenCodesRouter.put("/", usedCodeValid, usedCode);
tokenCodesRouter.get("/", getAuthInfoValid, getAuthInfo);
