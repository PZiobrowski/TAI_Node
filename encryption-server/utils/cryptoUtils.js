const crypto = require('crypto');

const key = crypto.createHash('sha256').update(String(process.env.KEY)).digest('base64').slice(0, 32);
const salt = process.env.SALT || crypto.randomBytes(8).toString("hex");

const cryptFileAESWithSalt = (
    file,
    decrypt = false
  ) => {
    if (!decrypt) {
      const cipher = crypto.createCipheriv('aes-256-ctr', key, salt);
      const crypted = Buffer.concat([cipher.update(file.data), cipher.final()]);
      return crypted;
    } else {
      const cipher = crypto.createDecipheriv('aes-256-ctr', key, salt);
      const decrypted = Buffer.concat([cipher.update(file.data), cipher.final()]);
      return decrypted;
    }
  };
  
  
  const cryptFileRSA = (
    file,
    decrypt = false
  ) => {
    if (!decrypt) {
    
      const publicKey = Buffer.from(
        fs.readFileSync("public.pem", { encoding: "utf-8" })
      ); 
      const encryptedData = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        // We convert the data string to a buffer using `Buffer.from`
        Buffer.from(file.data)
      );
      return encryptedData;
    } else {
      const privateKey = fs.readFileSync("private.pem", { encoding: "utf-8" });
      const decryptedData = crypto.privateDecrypt(
        {
          key: privateKey,
          // In order to decrypt the data, we need to specify the
          // same hashing function and padding scheme that we used to
          // encrypt the data in the previous step
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        Buffer.from(file.data)
      );
      return decryptedData;
    }
  };

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    // The standard secure default length for RSA keys is 2048 bits
    modulusLength: 2048,
  });
  
  const exportedPublicKeyBuffer = publicKey.export({
    type: "pkcs1",
    format: "pem",
  });
  
  const exportedPrivateKeyBuffer = privateKey.export({
    type: "pkcs1",
    format: "pem",
  });

  module.exports = {cryptFileAESWithSalt, cryptFileRSA, exportedPublicKeyBuffer, exportedPrivateKeyBuffer}