class FuckerServer {
  constructor() {
    this.middlewares =  [];
    this.routes = {
      GET: {},
      POST: {},
      HEAD: {}
    };
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
        for (const middleware of this.middlewares) {
          middleware(req, res);
        }
        // 处理路由
        if (method === "GET" && this.routes.GET[path]) {
          this.handleResponse(req, res, this.routes.GET[path](req, res));
        } else if (method === "POST" && this.routes.POST[path]) {
          this.handleResponse(req, res, this.routes.POST[path](req, res));
        } else if (method === "HEAD" && this.routes.HEAD[path]) {
          this.handleResponse(req, res, this.routes.HEAD[path](req, res));
        } else if (this.proxyTargets) {
          log.info(`[Proxy][${req.url}]`);
  
          // 处理代理请求
          req.headers.host = this.proxyTargets;
          const options = {
            hostname: this.proxyTargets,
            protocol: "https:",
            path: parsedUrl.path,
            method: method,
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
          // log.info(`[Proxy][${req.url}]`);
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
      log.info(`[${req.method}][${req.url}]`);
      if (response) {
        if (typeof response === "string" || response instanceof Buffer) {
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
  }