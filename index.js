const https = require("https");
const AWS = require("aws-sdk");
const { json } = require("body-parser");

const s3 = new AWS.S3({
  accessKeyId: "AKIA353WZ76QKHP4UU5T",
  secretAccessKey: "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",
});

exports.handler = async (event) => {
   const { payload, conversation, data } = JSON.parse(event.body);
   console.log("Payload is here: ",payload,"conversation is here",conversation)
   console.log("Data is here:",data)
   console.log("attachments are here:", data.ticket.attachments);
  const body = JSON.parse(event.body);
  const url = body.url;
  const bucketName = body.bucketName;
  const objectKey = body.objectKey;
  function wait() {
    return new Promise((res, rej) => setTimeout(res, 20000));
  }

  // return new Promise((resolve, reject) => {
  //   https
  //     .get(url, async (response) => {
  //       const chunks = [];
  //       response.on("data", (chunk) => {
  //         chunks.push(chunk);
  //       });
  //       response.on("end", async () => {
  //         const data = Buffer.concat(chunks);
  //         const params = {
  //           Bucket: bucketName,
  //           Key: `iConnect/Solution/${objectKey}`,
  //           Body: data,
  //         };
  //         try {
  //           await s3.putObject(params).promise();
  //           console.log("file downloaded");
  //           resolve({
  //             statusCode: 200,
  //             body: JSON.stringify({
  //               message: "File saved to S3",
  //             }),
  //           });
  //         } catch (err) {
  //           reject(err);
  //         }
  //       });
  //       await wait();
  //       const deleteParams = { Bucket: bucketName, Key: objectKey };
  //       await s3.deleteObject(deleteParams).promise();
  //       console.log("file deleted");
  //       resolve({
  //         body: JSON.stringify({
  //           message: "File is deleted",
  //         }),
  //       });
  //     })
  //     .on("error", (err) => {
  //       reject(err);
  //     });
  // });
};
