const esbuild = require("esbuild");
const obfuscator = require("javascript-obfuscator");
const fs = require("fs");
// 定义入口文件和输出文件
const entryFile = "dev.js";
const outputFile = "dist/bundle.js";

// 使用 esbuild 打包
esbuild
  .build({
    entryPoints: [entryFile], // 入口文件
    bundle: true, // 启用打包
    outfile: outputFile, // 输出文件
    minify: true, // 启用代码压缩
    sourcemap: true, // 生成 source map
    platform: "node", // 目标平台
    target: "es2020" // 目标环境
  })
  .then(() => {
    console.log("Build succeeded");
    // 读取打包后的文件内容
    const bundleCode = fs.readFileSync(outputFile, "utf8");
    // 使用 javascript-obfuscator 进行代码混淆
    const obfuscationResult = obfuscator.obfuscate(bundleCode, {
      compact: true,
      controlFlowFlattening: false,
      deadCodeInjection: false,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: false,
      identifierNamesGenerator: "hexadecimal",
      log: false,
      numbersToExpressions: false,
      renameGlobals: false,
      renameProperties: false,
      selfDefending: true,
      simplify: true,
      splitStrings: false,
      stringArray: true,
      stringArrayCallsTransform: false,
      stringArrayEncoding: [],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 1,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 2,
      stringArrayWrappersType: "variable",
      stringArrayThreshold: 0.75,
      unicodeEscapeSequence: true
    });
    // 将混淆后的代码写入输出文件
    fs.writeFileSync(outputFile, obfuscationResult.getObfuscatedCode());
    console.log("Code obfuscation succeeded");
  })
  .catch(() => process.exit(1));
