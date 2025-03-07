import CryptoJS from "crypto-js";

export const encrypt = ({ data, secretKey = process.env.CRYPTO_KEY }) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};