const express = require('express')
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const crypto = require('crypto');
const fs = require('fs');
const app = express()
const port = 3000

const key = crypto.createHash('sha256').update(String(process.env.KEY)).digest('base64').slice(0, 32);
const salt = process.env.SALT || crypto.randomBytes(8).toString("hex");

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

app.use(fileUpload({
  createParentPath: true
}));

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

app.post('/upload/no-encryption', async (req, res) => {
  try {
      if(!req.files) {
          res.send({
              status: false,
              message: 'No file uploaded'
          });
      } else {
          let file = req.files.file;

          randomName = Math.floor(Math.random() * 999999999) + file.name;

          file.mv('./uploads/' + randomName);

          //send response
          res.send({
              status: true,
              message: 'File is uploaded',
              data: {
                  name: randomName,
                  mimetype: file.mimetype,
                  size: file.size,
                  time: 0
              }
          });
      }
  } catch (err) {
      res.status(500).send(err);
  }
});


app.post('/upload/encryption', async (req, res) => {
  try {
      if(!req.files) {
          res.send({
              status: false,
              message: 'No file uploaded'
          });
      } else {
          let file = req.files.file;
          let encrypted

          const start = performance.now();

          if(req.body.algorithm == '0') {
            console.log("encryption with aes")
            encrypted = cryptFileAESWithSalt(file, false);
          } else 
          {
            console.log("encryption with rsa")
            encrypted = cryptFileRSA(file, false);
          }

          const duration = (performance.now() - start).toPrecision(2)

          console.log("measured encryption duration " + duration)

          randomName = Math.floor(Math.random() * 999999999) + file.name;

          fs.createWriteStream('./uploads/' + randomName).write(encrypted)

          //send response
          res.send({
              status: true,
              message: 'File is encrypted',
              data: {
                  name: randomName,
                  mimetype: file.mimetype,
                  size: file.size,
                  time: duration
              }
          });
      }
  } catch (err) {
      console.log(err)
      res.status(500).send(err);
  }
});

app.post('/upload/decryption', async (req, res) => {
  try {
      if(!req.files) {
          res.send({
              status: false,
              message: 'No file uploaded'
          });
      } else {
          let file = req.files.file;
          let decrypted

          const start = performance.now();

          if(req.body.algorithm == '0') {
            console.log("decryption with aes")
            decrypted = cryptFileAESWithSalt(file, true);
          } else 
          {
            console.log("decryption with rsa")
            decrypted = cryptFileRSA(file, true);
          }

          const duration = (performance.now() - start).toPrecision(2)
          console.log("measured decryption duration " + duration)

          randomName = Math.floor(Math.random() * 999999999) + file.name;

          fs.createWriteStream('./uploads/' + randomName).write(decrypted)

          //send response
          res.send({
            status: true,
            message: 'File is decrypted',
            data: {
                name: randomName,
                mimetype: file.mimetype,
                size: file.size,
                time: duration
            }
        });   

      }
  } catch (err) {
      console.log(err)
      res.status(500).send(err);
  }
});

app.post('/download', async (req, res) => {
  try {
      if(!req.body.fileName) {
          res.send({
              status: false,
              message: 'No file name specified'
          });
      } else {
          let fileName = req.body.fileName;

        res.sendFile(__dirname  + '/uploads/' + fileName)
      }
  } catch (err) {
      console.log(err)
      res.status(500).send(err);
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  //fs.writeFileSync("public.pem", exportedPublicKeyBuffer, { encoding: "utf-8" });
  // fs.writeFileSync("private.pem", exportedPrivateKeyBuffer, {
  //   encoding: "utf-8",
  // });
  console.log(`Example app listening on port ${port}`)
})


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