
var SubMsg = ""
// AES解密函数
//
function decryptData(encryptedData, key) {
    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      Buffer.from(key, "utf8"),
      Buffer.from(key, "utf8")
    );
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }