const esbuild = require("esbuild");
const _path = require("path");
const obfuscator = require("javascript-obfuscator");
const fs = require("fs");
/* const { minify } = require('uglify-js');
function minifyAndSave(inputFilePath, outputFilePath) {
  try {
      // 读取文件内容
      const code = fs.readFileSync(inputFilePath, 'utf8');

      // 使用uglify-js压缩代码
      const result = minify(code);

      if (result.error) {
          console.error('Error during minification:', result.error);
          return;
      }

      // 写入压缩后的代码到输出文件
      fs.writeFileSync(outputFilePath, result.code, 'utf8');
      console.log(`Successfully saved minified code to ${outputFilePath}`);
  } catch (err) {
      console.error('Error while processing:', err);
  }
}
 */
// 定义入口文件和输出文件
const entryFile = "dev.js";
const outputDir = "asset";
const outputFile = "dist/xmind.js";

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

// 使用 esbuild 打包
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
    console.log("Build succeeded");
    // 读取打包后的文件内容
    const bundleCode = fs.readFileSync(outputFile, "utf8");
    const bundleCode_obguscation_result = obfuscator.obfuscate(
      bundleCode,
      obNodeConfig
    );

    const renderer_crypto = fs.readFileSync("src/hook/crypto.js", "utf8");
    const renderer_crypto_obfuscation_result = obfuscator.obfuscate(
      renderer_crypto,
      obNodeConfig
    );
    const renderer_singin = fs.readFileSync("src/rendererFix/dialog-signin.js", "utf8");
    const renderer_singin_obfuscation_result = obfuscator.obfuscate(
      renderer_singin,
      obBrowserConfig
    );
    const dialog_gift_card_fix = fs.readFileSync("src/rendererFix/dialog-gift-card.fix.js", "utf8");
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
    console.log("Code obfuscation succeeded");
  })
  .catch(() => process.exit(1));
