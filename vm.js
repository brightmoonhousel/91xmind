const vm = require("vm");
const fs = require("fs");
var filepath = "./listen.js";
var code = fs.readFileSync(filepath, "utf-8");
var script = new vm.Script(require("module").wrap(code));
//得到字节码，即bytecode
var bytecode = script.createCachedData();
fs.writeFileSync(filepath.replace(/\.js$/i, ".bytecode"), bytecode);
