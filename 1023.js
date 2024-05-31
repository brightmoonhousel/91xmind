//服务器框架
const { https, log } = require("./1024");
const url = require("url");
const http = require("http");

// 定义一个空数组来存储中间件
const middlewares = [];

// 定义一个空对象来存储路由
const routes = {
  GET: {},
  POST: {},
  HEAD: {},
};

var proxyTargets = "";

// 创建一个简单的框架类
class FuckerServer {
  // 添加中间件
  use(middleware) {
    middlewares.push(middleware);
  }

  get(path, handler) {
    routes.GET[path] = handler;
  }
  head(path, handler) {
    routes.HEAD[path] = handler;
  }

  post(path, handler) {
    routes.POST[path] = handler;
  }

  proxy(target) {
    proxyTargets = target;
  }

  // 启动服务器
  start(port, host, options) {
    // 创建 HTTPS 服务器
    const httpOrhttps = options ? https : http;
    const server = httpOrhttps.createServer(options, (req, res) => {
      const parsedUrl = url.parse(req.url, true);
      // 获取请求路径
      const path = parsedUrl.pathname;
      // 获取请求方法
      const method = req.method;

      // 将查询参数保存在 req.query 中
      req.query = parsedUrl.query;

      // 调用中间件
      for (const middleware of middlewares) {
        middleware(req, res);
      }

      // 处理路由
      if (method === "GET" && routes.GET[path]) {
        this.handleResponse(req, res, routes.GET[path](req, res));
      } else if (method === "POST" && routes.POST[path]) {
        this.handleResponse(req, res, routes.POST[path](req, res));
      } else if (method === "HEAD" && routes.HEAD[path]) {
        this.handleResponse(req, res, routes.HEAD[path](req, res));
      } else if (proxyTargets) {
        if (path.startsWith("/xmind/update")) {
          log.info(`[Proxy][${req.url}]`);
        }
        // 处理代理请求
        req.headers.host = proxyTargets;
        const options = {
          hostname: proxyTargets,
          protocol: "https:",
          path: parsedUrl.path,
          method: method,
          headers: req.headers,
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
        // log.success(`[Proxy][${req.url}]`);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
      }
    });

    server.listen(port, host, () => {
      log.info(
        `server start success ${options ? "https" : "http"}://${host}:${port}`
      );
    });
  }

  // 处理路由函数返回的内容
  handleResponse(req, res, response) {
    //log.success(`[${req.method}][${req.url}]`);
    if (response) {
      if (typeof response === "string" || Buffer.isBuffer(response)) {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(response);
      } else if (typeof response === "object") {
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
        });
        res.end(JSON.stringify(response));
      } else {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(response.toString());
      }
    }
  }
}

// 导出框架类
module.exports = FuckerServer;
