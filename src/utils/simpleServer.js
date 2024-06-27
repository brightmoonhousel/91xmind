//简单服务器框架
const url = require("url");
const http = require("http");
const https = require("https");
const log = require("./logUtils");
// 创建一个简单的框架类
class simpleServer {
  constructor() {
    this.routes = {
      GET: {},
      POST: {},
      HEAD: {}
    };
    this.middlewares = [];
    this.proxyTargets = "";
  }

  // 添加中间件
  use(middleware) {
    this.middlewares.push(middleware);
  }

  get(path, handler) {
    this.routes.GET[path] = handler;
  }
  head(path, handler) {
    this.routes.HEAD[path] = handler;
  }

  post(path, handler) {
    this.routes.POST[path] = handler;
  }

  proxy(target) {
    this.proxyTargets = target;
  }

  // 启动服务器
  async start(port, host, options) {
    // 创建 HTTPS 服务器
    const httpOrhttps = options ? https : http;
    const server = httpOrhttps.createServer(options, async (req, res) => {
      const parsedUrl = url.parse(req.url, true);
      const path = parsedUrl.pathname;
      const method = req.method;
      // 将查询参数保存在 req.query 中
      req.query = parsedUrl.query;
      // 调用中间件
      for (const middleware of this.middlewares) {
        middleware(req, res);
      }
      switch (method) {
        case "GET":
          if (this.routes.GET[path])
            this.handleResponse(req, res, await this.routes.GET[path](req, res));
          break;
        case "POST":
          if (this.routes.POST[path]) {
            this.requestBodyHandlerResponse(req, res, path);
          }
          break;
        case "HEAD":
          if (this.routes.HEAD[path])
            this.handleResponse(req, res, await this.routes.HEAD[path](req, res));
          break;
        default:
          if (this.proxyTargets) this.handleProxyRequest(req, res, this.proxyTargets);
          break;
      }
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    });

    server.listen(port, host, () => {
      log.colors(`server start success ${options ? "https" : "http"}://${host}:${port}`);
    });
  }

  // 处理路由函数返回的内容
  async requestBodyHandlerResponse(req, res, path) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        req.body = JSON.parse(body);
      } catch (e) {
        req.body = {};
      }
      const response = await this.routes.POST[path](req, res);
      this.handleResponse(req, res, response);
    });
  }

  async handleResponse(req, res, response) {
    if (response) {
      if (typeof response === "string" || Buffer.isBuffer(response)) {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(response);
      } else if (typeof response === "object") {
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8"
        });
        res.end(JSON.stringify(response));
      } else {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(response.toString());
      }
    }
  }
  async handleProxyRequest(req, res, proxyTargets) {
    // 处理代理请求
    req.headers.host = proxyTargets;
    const options = {
      hostname: proxyTargets,
      protocol: "https:",
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    req.pipe(proxyReq, { end: true });
    proxyReq.on("error", (err) => {
      log.error("[proxy error]:", err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Proxy error");
    });
  }
}

// 导出框架类
module.exports = simpleServer;
