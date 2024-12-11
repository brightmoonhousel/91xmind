const obfuscator = require("javascript-obfuscator");
const esbuild = require("esbuild");
const _path = require("path");
const fs = require("fs");
const entryFile = "dev.js";
const outputDir = "../xmindcli/internal/crack/asset";
const outputFile = "xmind.js";
const obNodeConfig = {
  compact: true,
  target:"node",
  unicodeEscapeSequence: true
};
const obBrowserConfig = {
  compact: true,
  target: "browser",
  unicodeEscapeSequence: true
};
esbuild
  .build({
    legalComments: "none",
    entryPoints: [entryFile], // 入口文件
    bundle: true, // 启用打包
    outfile: outputFile, // 输出文件
    minify: true, // 启用代码压缩
    sourcemap: false, // 生成 source map
    platform: "node", // 目标平台
    external: ["electron", "./main", "./main.bytecode"],
    treeShaking: true // 启用摇树优化
  })
  .then(() => {
    // 读取打包后的文件内容
    const bundleCode = fs.readFileSync(outputFile, "utf8");
    const bundleCode_obguscation_result = obfuscator.obfuscate(
      bundleCode,
      obNodeConfig
    );
    const renderer_crypto = fs.readFileSync("src/main_hook/crypto.js", "utf8");
    const renderer_crypto_obfuscation_result = obfuscator.obfuscate(
      renderer_crypto,
      obNodeConfig
    );
    const renderer_singin = fs.readFileSync("src/renderer_hook/dialog-signin.js", "utf8");
    const renderer_singin_obfuscation_result = obfuscator.obfuscate(
      renderer_singin,
      obBrowserConfig
    );
    const dialog_gift_card_fix = fs.readFileSync("src/renderer_hook/dialog-gift-card.fix.js", "utf8");
    const dialog_gift_card_fix_obfuscation_result = obfuscator.obfuscate(
      dialog_gift_card_fix,
      obBrowserConfig
    );
    
    // 将混淆后的代码写入输出文件
    fs.writeFileSync(
      _path.join(outputDir, "xmind.js"),
      bundleCode_obguscation_result.getObfuscatedCode()
    );
    fs.writeFileSync(
      _path.join(outputDir, "crypto.js"),
      renderer_crypto_obfuscation_result.getObfuscatedCode()
    );
    fs.writeFileSync(
      _path.join(outputDir, "dialog-signin.js"),
      renderer_singin_obfuscation_result.getObfuscatedCode()
    );
    fs.writeFileSync(
      _path.join(outputDir, "dialog-gift-card.fix.js"),
      dialog_gift_card_fix_obfuscation_result.getObfuscatedCode()
    );
  })
  .catch(() => process.exit(1));

  console.log("xmind_hook Build and obfuscation succeeded!");