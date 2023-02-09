const fs = require("fs");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const express = require("express");
const app = express();

app.use(express.json());
dotenv.config();

// respond with "hello world" when a GET request is made to the homepage
const port = 3000;

app.get("/", (req, res) => {
  res.send("Server is Running on Port: nodejs.adityatawade.com");
});

const downloadImage = (url, fileName, uploadFile) => {
  const https = require("https");
  const fs = require("fs");

  https
    .get(url, (resp) => resp.pipe(fs.createWriteStream(fileName)))
    .on("close", () => {
      console.log("Downloaded File");
      uploadFile();
    });
};

const deleteFile = (filename) => {
  try {
    fs.unlinkSync(filename);
    //file removed
  } catch (err) {
    console.error(err);
  }
};

const uploadFile = (ticket_id, conversation_id, filename, s3) => {
  // Read content from the file
  console.log("Uploading file");
  const fileContent = fs.readFileSync(filename);

  // Setting up S3 upload parameters
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${ticket_id}/${conversation_id}/${filename}`, // File name you want to save as in S3
    Body: fileContent,
  };
  // Uploading files to the bucket
  s3.upload(params, function (err, data) {
    if (err) {
      deleteFile(filename);
      throw err;
    }
    deleteFile(filename);
    console.log(`File uploaded successfully. ${data.Location}`);
    console.log("Downloaded File Deleted");
  });
};

function handleAttachment(ticket_id, conversation_id, url, fileName, s3) {
  downloadImage(url, fileName, () =>
    uploadFile(ticket_id, conversation_id, fileName, s3)
  );
}

app.post("/s3_upload", (req, res) => {
  const { payload, conversation } = req.body;
  let AWS_ACCESS_KEY = payload.iparams.AWSACCESSKEYID;
  let AWS_SECRET_ACCESS_KEY = payload.iparams.AWSSECRETACCESSKEY;
  let AWS_BUCKET_NAME = payload.iparams.AWSBUCKETNAME;
  // Checks If file exists in s3
  let params = {
    Bucket: AWS_BUCKET_NAME /* required */,
    Prefix: req.body.conversation.conversations[0].ticket_id.toString(), // Can be your folder name
  };
  const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });

  s3.listObjectsV2(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    if (data?.Contents) {
      let existing_conversations = data.Contents.map(
        (obj) => obj.Key.split("/")[1]
      );
      existing_conversations = [...new Set(existing_conversations)];
      conversation.conversations.map((conversation) => {
        const attachments = conversation.attachments;
        const ticket_id = conversation.ticket_id;
        const conversation_id = conversation.id;
        if (existing_conversations.includes(conversation_id.toString())) return;
        attachments.forEach((attachmnet) => {
          handleAttachment(
            ticket_id,
            conversation_id,
            attachmnet.attachment_url,
            attachmnet.name,
            s3
          );
        });
      });
      res.send("File successfully uploaded to s3");
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
