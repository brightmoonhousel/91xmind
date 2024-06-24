// AES加密解密函数
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

function encryptData(data, key) {
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    Buffer.from(key, "utf8"),
    Buffer.from(key, "utf8")
  );
  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

async function readDataFromFile(path) {
  try {
    return fs.promises.readFile(path, "utf8");
  } catch (err) {
    console.error("Error reading data from file:", err);
    throw err;
  }
}
async function saveDataToFile(path, data) {
  try {
    await fs.promises.writeFile(path, data, "utf8");
  } catch (err) {
    return err;
  }
}