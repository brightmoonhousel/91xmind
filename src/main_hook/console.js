const console = require("console");
// 设置debug模式
if (!process.argv.includes("@")) {
  console.warn = console.error = console.log = () => {};
}
module.exports = console;