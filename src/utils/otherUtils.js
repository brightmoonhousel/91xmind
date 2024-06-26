// AES加密解密函数
const fs = require("fs");
const crypto = require("crypto");
const {aesKey,privateKey} = require("../config");
const fileUtils = {
  decryptAesData: (encryptedData) => {
    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      Buffer.from(aesKey, "utf8"),
      Buffer.from(aesKey, "utf8")
    );
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  },
  encryptAesData: (data) => {
    const cipher = crypto.createCipheriv(
      "aes-128-cbc",
      Buffer.from(aesKey, "utf8"),
      Buffer.from(aesKey, "utf8")
    );
    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  },
  readDataFromFile: async (path) => {
    try {
      return fs.promises.readFile(path, "utf8");
    } catch (err) {
      console.error("Error reading data from file:", err);
      throw err;
    }
  },
  saveDataToFile: async (path, data) => {
    try {
      await fs.promises.writeFile(path, data, "utf8");
    } catch (err) {
      return err;
    }
  },
  fileIsExit: (path) => {
    return fs.existsSync(path);
  },
  encryptRsaData: (data) => {
    try {
      const encryptedData = crypto.privateEncrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING // RSA 加密填充方式
        },
        Buffer.from(data, "utf8")
      );
      return encryptedData.toString("base64");
    } catch (error) {
      console.error("Error during RSA encryption:", error);
      return null;
    }
  }
};

module.exports = fileUtils;
