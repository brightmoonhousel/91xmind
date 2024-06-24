class FetchData {
    constructor(baseUrl) {
      this.baseUrl = baseUrl;
    }
  
    async fetch(path, { method = "GET", headers = {}, body, params } = {}) {
      const url = this.baseUrl ? new URL(path, this.baseUrl) : new URL(path);
  
      if (params) {
        Object.keys(params).forEach((key) =>
          url.searchParams.append(key, params[key])
        );
      }
  
      const requestOptions = {
        method: method.toUpperCase(),
        headers: {
          "Content-Type": "application/json",
          ...headers
        }
      };
  
      if (method !== "GET" && body) {
        requestOptions.body = JSON.stringify(body);
      }
  
      const protocol = url.protocol === "https:" ? https : http;
  
      return new Promise((resolve, reject) => {
        const req = protocol.request(url, requestOptions, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          // End response
          res.on("end", () => {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage,
              headers: res.headers,
              text: () => Promise.resolve(data),
              json: () => Promise.resolve(JSON.parse(data))
            });
          });
        });
  
        req.on("error", (error) => {
          reject(error);
        });
  
        if (method !== "GET" && body) {
          req.write(requestOptions.body);
        }
  
        req.end();
      });
    }
  }