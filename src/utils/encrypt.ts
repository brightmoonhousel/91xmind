import CryptoJS from "crypto-js";
// 加密函数
function encryptData(data: string, key: string): string {
  const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: CryptoJS.enc.Utf8.parse(key) // 使用密钥作为 IV
  }).toString();
  return encrypted;
}

export default encryptData;