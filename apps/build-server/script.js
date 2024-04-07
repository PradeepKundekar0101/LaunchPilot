const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const mimetypes = require("mime-types");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const Redis = require("ioredis");
// const { Kafka } = require("kafkajs");
dotenv.config();

const PROJECT_ID = process.env.PROJECT_ID;
const API_SERVER_URL = process.env.API_SERVER_URL;
const REDIS_URI = process.env.REDIS_URI;
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID;
const JWT_TOKEN = process.env.JWT_TOKEN;
// const KAFKA_BROKER = process.env.KAFKA_BROKER;
// const SASL_USERNAME = process.env.SASL_USERNAME;
// const SASL_PASSWORD = process.env.SASL_PASSWORD;

const publisher = new Redis(REDIS_URI);

// const kafkaClient = new Kafka({
//   brokers: [`${KAFKA_BROKER}`],
//   clientId: `build-server`,
//   ssl: {
//     ca: fs.readFileSync(path.join(__dirname, "kafka-ca.pem"), "utf-8"),
//   },
//   sasl: {
//     username: SASL_USERNAME,
//     password: SASL_PASSWORD,
//     mechanism: "plain",
//   },
// });
// const producer = kafkaClient.producer();

const publishLog = (log) => {
  // await producer.send({
  //   topic: "logs",
  //   messages: [
  //     {
  //       key: "log",
  //       value: JSON.stringify({ PROJECT_ID, DEPLOYMENT_ID, log }),
  //     },
  //   ],
  // });
  publisher.publish(`logs:${DEPLOYMENT_ID}`, JSON.stringify({ log }));
};
const updateDeploymentStatus = async(status)=>{
  const res = await fetch(`${API_SERVER_URL}/api/v1/project/deploy/${DEPLOYMENT_ID}`,{
    method:"PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JWT_TOKEN}`
    },body: JSON.stringify({status})
  })
  const json = await res.json();
  if(!json.success){
    console.log("Status Updation failed");
  }
}

const s3client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
let error = false;
async function init() {
  // await producer.connect();
  await updateDeploymentStatus("IN_PROGRESS");
  console.log("Building project");
  publishLog("Building project...");
  const outdirpath = path.join(__dirname, "output");

  const p = exec(`cd ${outdirpath} && npm install && npm run build`);
  p.stdout.on("data", async (data) => {
    publishLog(data.toString());
    console.log(data.toString());
  });

  p.stdout.on("error", async (data) => {
    error = true;
    publishLog(`Error: ${data.toString()}`);
    console.log("Error:" + data.toString());
    await updateDeploymentStatus("FAILED");
  });
  p.stdout.on("close", async () => {
    if(!error){
      console.log("Build completed sucessfully");
      publishLog("Build completed sucessfully");
    }
    else{
      console.log("Error: Build Failed");
      publishLog(`Error: Build failed`);
      process.exit(0)
    }
    

    const folderPath = path.join(__dirname, "output", "dist");
    const distFolderContent = fs.readdirSync(folderPath, { recursive: true });

    for (const file of distFolderContent) {
      const filePath = path.join(folderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) 
        continue;
      publishLog("Deployment Started!");
      console.log("Uploading " + filePath);
      publishLog(`Uploading ${file}`);
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `outputs/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mimetypes.lookup(filePath),
      });
      await s3client.send(command);
    }
    
    publishLog(`Deployed 🎉`);
    console.log("Deployed");
    await updateDeploymentStatus("DEPLOYED")
    process.exit(0);
  });
}
init();
