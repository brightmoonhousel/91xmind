import { Hono } from "hono";
import { userUpdatePassword, userGetInfo } from "../../controllers";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
//验证器
const pwdValid = zValidator(
  "json",
  z
    .object({
      old_pwd: z.string().min(6).max(15),
      new_pwd: z.string().min(6).max(15),
      re_pwd: z.string().min(6).max(15)
    })
    .strict()
    .refine((data) => data.new_pwd === data.re_pwd, {
      message: "两次密码输入不一致"
    }),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json({ code: 400, message: messages.join(",") });
    }
  }
);

export const userInfoRouter = new Hono();
userInfoRouter.get("/", userGetInfo);
userInfoRouter.patch("/", pwdValid, userUpdatePassword);
