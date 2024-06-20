import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import creatToken from "../controllers/createToken";
import getTokenByCode from "../controllers/getTokenByCode";
import deleteTokenByCode from "../controllers/deletTokenByCode";

const option = {
    token:'Tencent',
    prefix:'FuckYou',
    headerName:'Authorization'
};

const tokenRoutes = new Hono();
tokenRoutes.post("/", bearerAuth(option), creatToken);
tokenRoutes.get("/", getTokenByCode);
tokenRoutes.delete("/", deleteTokenByCode);
export default tokenRoutes;
