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

          file.mv('./uploads/' + file.name);

          //send response
          res.send({
              status: true,
              message: 'File is uploaded',
              data: {
                  name: file.name,
                  mimetype: file.mimetype,
                  size: file.size
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

          const encrypted = cryptFileWithSalt(file, false);

          fs.createWriteStream('./uploads/' + file.name).write(encrypted)

          //send response
          res.send({
              status: true,
              message: 'File is uploaded',
              data: {
                  name: file.name,
                  mimetype: file.mimetype,
                  size: file.size
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

          console.log("dupa1")

          const decrypted = cryptFileWithSalt(file, true);

          console.log("dupa2")

          //send response
          if (file) {
            res.writeHead(200, {
                'Content-Type': file.mimetype,
                'Content-disposition': 'attachment;filename=' + 'encrypted_' + file.name,
                'Connection': 'close',
            })
        } else {
            res.writeHead(200, {
                'Connection': 'close'
            })
        }
        res.end(decrypted);
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
  console.log(`Example app listening on port ${port}`)
})


const cryptFileWithSalt = (
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