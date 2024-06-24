const fs = require("fs");
const path = require("path");
// 遍历文件夹并读取内容的函数

function traverseFolders(...folders) {
  let totalContent = "";

  folders.forEach((folder) => {
    const files = fs.readdirSync(folder);

    files.forEach((file) => {
      const filePath = path.join(folder, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalContent += traverseFolders(filePath); // 递归遍历子文件夹
      } else if (stats.isFile()) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        totalContent += fileContent;
      }
    });
  });

  return totalContent;
}

const yamlFilePath = path.join(__dirname, "./src/lib/js-yaml.min.js");
const indexFilePath = path.join(__dirname, "./src/index.js");

/**lib */
/**index */

/**utils */
/**service */
/**hook */
/**init */

const libContent = fs.readFileSync(yamlFilePath, "utf-8");
const indexContent = fs.readFileSync(indexFilePath, "utf-8");
const content = traverseFolders(
  path.join(__dirname, "./src/utils"),
  path.join(__dirname, "./src/service"),
  path.join(__dirname, "./src/hook"),
  path.join(__dirname, "./src/init")
);

const xmindContent = libContent + indexContent + content ;

const outputFilePath = path.join(__dirname, "xmind.js");
fs.writeFileSync(outputFilePath, xmindContent, "utf-8");
console.log("\n----------------build dev success------------------\n");

require("./xmind");
