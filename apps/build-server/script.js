const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const mimetypes = require("mime-types");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
// const Redis = require("ioredis");
const { Kafka } = require("kafkajs");
dotenv.config();

const PROJECT_ID = process.env.PROJECT_ID;
// const REDIS_URI = process.env.REDIS_URI;
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID;
const KAFKA_BROKER = process.env.KAFKA_BROKER;
const SASL_USERNAME = process.env.SASL_USERNAME;
const SASL_PASSWORD = process.env.SASL_PASSWORD;

// const publisher = new Redis(REDIS_URI);

const kafkaClient = new Kafka({
  brokers: [`${KAFKA_BROKER}`],
  clientId: `build-server`,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "kafka-ca.pem"), "utf-8"),
  },
  sasl: {
    username: SASL_USERNAME,
    password: SASL_PASSWORD,
    mechanism: "plain",
  },
});
const producer = kafkaClient.producer();

const publishLog = async (log) => {
  await producer.send({
    topic: "logs",
    messages: [
      {
        key: "log",
        value: JSON.stringify({ PROJECT_ID, DEPLOYMENT_ID, log }),
      },
    ],
  });
  // publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({log}) );
};

const s3client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function init() {
  await producer.connect();
  console.log("Building project");
  await publishLog("Building...");
  const outdirpath = path.join(__dirname, "output");

  const p = exec(`cd ${outdirpath} && npm install && npm run build`);
  p.stdout.on("data", async (data) => {
    await publishLog(data.toString());
    console.log(data.toString());
  });

  p.stdout.on("error", async (data) => {
    await publishLog(`Error: ${data.toString()}`);
    console.log("Error:" + data.toString());
  });
  p.stdout.on("close", async () => {
    console.log("Build completed");
    await publishLog("Build completed");
    const folderPath = path.join(__dirname, "output", "dist");
    const distFolderContent = fs.readdirSync(folderPath, { recursive: true });
    for (const file of distFolderContent) {
      const filePath = path.join(folderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) continue;
      console.log("Uploading " + filePath);
      await publishLog(`Uploading ${file}`);
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `outputs/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mimetypes.lookup(filePath),
      });
      await publishLog("Deploying...");
      await s3client.send(command);
      await publishLog(`Deployed 🎉`);
      console.log("Deployed");
      process.exit(0);
    }
  });
}
init();
