import { Hono } from "hono";
import { userLogin, userRegister } from "../../controllers";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

//验证器
const loginValid = zValidator(
  "json",
  z
    .object({
      username: z.string().min(1).max(20),
      password: z.string().min(6).max(15)
    })
    .strict(),
  (value, c) => {
    if (!value.success) {
      const messages = value.error.errors.map((error) => error.message);
      return c.json( {code: 400, message: messages.join(",")  });
    }
  }
);

export const loginRouter = new Hono();
loginRouter.post("/", loginValid, userLogin);
loginRouter.put("/", loginValid, userRegister);
