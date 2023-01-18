const cryptoUtils = require('./utils/cryptoUtils.js')
const express = require('express')
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const app = express()
const port = 3000

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
            encrypted = cryptoUtils.cryptFileAESWithSalt(file, false);
          } else
          {
            console.log("encryption with rsa")
            encrypted = cryptoUtils.cryptFileRSA(file, false);
          }

          const duration = (performance.now() - start).toFixed(2)

          console.log("measured encryption duration " + duration)

          randomName = Math.floor(Math.random() * 999999999) + file.name;
          fs.createWriteStream('./uploads/' + randomName).write(encrypted)

          const durationWithSave = (performance.now() - start).toFixed(2)
          console.log("measured encryption+save duration " + durationWithSave)

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

app.post('/upload/encryption-stream', async (req, res) => {
  try {
      if(!req.files) {
          res.send({
              status: false,
              message: 'No file uploaded'
          });
      } else {
          let file = req.files.file;

          const start = performance.now();

          const randomName = Math.floor(Math.random() * 999999999) + file.name;
          const outStream = fs.createWriteStream('./uploads/' + randomName);

          if (req.body.algorithm == '0') {
            console.log("encryption with aes")
            cryptoUtils.cryptFileAESWithSalt(file, false);
          } else {
            console.log("encryption with rsa")
            cryptoUtils.streamCryptFileRSA(file, outStream, false);
          }

          outStream.end();
          const duration = (performance.now() - start).toFixed(2)

          console.log("measured encryption duration " + duration)

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
            decrypted = cryptoUtils.cryptFileAESWithSalt(file, true);
          } else
          {
            console.log("decryption with rsa")
            decrypted = cryptoUtils.cryptFileRSA(file, true);
          }

          const duration = (performance.now() - start).toFixed(2)
          console.log("measured decryption duration " + duration)

          randomName = Math.floor(Math.random() * 999999999) + file.name;
          fs.createWriteStream('./uploads/' + randomName).write(decrypted)

          const durationWithSave = (performance.now() - start).toFixed(2)
          console.log("measured decryption+save duration " + durationWithSave)

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

app.post('/upload/decryption-stream', async (req, res) => {
  try {
      if(!req.files) {
          res.send({
              status: false,
              message: 'No file uploaded'
          });
      } else {
          let file = req.files.file;

          const start = performance.now();

          const randomName = Math.floor(Math.random() * 999999999) + file.name;
          const outStream = fs.createWriteStream('./uploads/' + randomName);

          if (req.body.algorithm == '0') {
            console.log("decryption with aes")
            cryptoUtils.cryptFileAESWithSalt(file, true);
          } else {
            console.log("decryption with rsa")
            cryptoUtils.streamCryptFileRSA(file, outStream, true);
          }

          outStream.end();
          const duration = (performance.now() - start).toFixed(2)

          console.log("measured decryption duration " + duration)

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
  //fs.writeFileSync("public.pem", cryptoUtils.exportedPublicKeyBuffer, { encoding: "utf-8" });
  // fs.writeFileSync("private.pem", cryptoUtils.exportedPrivateKeyBuffer, {
  //   encoding: "utf-8",
  // });
  console.log(`Example app listening on port ${port}`)
})