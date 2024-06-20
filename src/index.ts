import { Hono } from "hono";
import { Context } from "hono";
import tokenRoutes from "./routes/tokenRoutes";
type Bindings = {
  latestversion: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.get("/", async (c: Context) => {
  return c.json({ version: c.env.latestversion });
});
app.route("/api/v1/token", tokenRoutes);

export default app;
