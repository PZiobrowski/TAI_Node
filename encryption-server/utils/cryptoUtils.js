const crypto = require('crypto');
const fs = require('fs');

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
      const publicKey = Buffer.from(fs.readFileSync("public.pem", { encoding: "utf-8" }));

      const fileBuffer = Buffer.from(file.data);
      let encryptedData = Buffer.alloc(0);
      for (let i = 0; i < fileBuffer.length; i += 128) {
        const chunk = fileBuffer.subarray(i, Math.min(i + 128, fileBuffer.length));
        const encrypted = crypto.publicEncrypt(
          {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256"
          },
          chunk
        );
        encryptedData = Buffer.concat([encryptedData, encrypted]);
      }
      return encryptedData;
    } else {
      const privateKey = Buffer.from(fs.readFileSync("private.pem", { encoding: "utf-8" }));

      const encryptedBuffer = Buffer.from(file.data);
      let decryptedData = Buffer.alloc(0);
      for (let i = 0; i < encryptedBuffer.length; i += 256) {
        const encrypted = encryptedBuffer.subarray(i, i + 256);
        const chunk = crypto.privateDecrypt(
          {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256"
          },
          encrypted
        );
        decryptedData = Buffer.concat([decryptedData, chunk]);
      }
      return decryptedData;
    }
  };

  const streamCryptFileRSA = (
    file,
    outStream,
    decrypt = false
  ) => {
    if (decrypt) {
      const privateKey = Buffer.from(fs.readFileSync("private.pem", { encoding: "utf-8" }));

      const encryptedBuffer = Buffer.from(file.data);
      for (let i = 0; i < encryptedBuffer.length; i += 256) {
        const encrypted = encryptedBuffer.subarray(i, i + 256);
        const chunk = crypto.privateDecrypt(
          {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256"
          },
          encrypted
        );
        outStream.write(chunk);
      }
    } else {
      const publicKey = Buffer.from(fs.readFileSync("public.pem", { encoding: "utf-8" }));

      const fileBuffer = Buffer.from(file.data);
      for (let i = 0; i < fileBuffer.length; i += 128) {
        const chunk = fileBuffer.subarray(i, Math.min(i + 128, fileBuffer.length));
        const encrypted = crypto.publicEncrypt(
          {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256"
          },
          chunk
        );
        outStream.write(encrypted);
      }
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

  module.exports = {cryptFileAESWithSalt, cryptFileRSA, exportedPublicKeyBuffer, exportedPrivateKeyBuffer, streamCryptFileRSA}