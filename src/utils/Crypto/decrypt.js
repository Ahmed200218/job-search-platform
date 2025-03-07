import CryptoJS from "crypto-js";

export const decrypt = ({ data, secretKey = process.env.CRYPTO_KEY }) => {
    
  const bytes = CryptoJS.AES.decrypt(data, secretKey);
  
  return bytes.toString(CryptoJS.enc.Utf8);
};