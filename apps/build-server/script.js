const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const mimetypes = require("mime-types");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const Redis = require("ioredis");

dotenv.config();

const PROJECT_ID = process.env.PROJECT_ID;
const API_SERVER_URL = process.env.API_SERVER_URL;
const REDIS_URI = process.env.REDIS_URI;
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID;
const JWT_TOKEN = process.env.JWT_TOKEN;

const publisher = new Redis(REDIS_URI);

const publishLog = (log) => {
  publisher.publish(`logs:${DEPLOYMENT_ID}`, JSON.stringify({ log }));
};

const updateDeploymentStatus = async (status) => {
  try {
    console.log(status)
    const res = await fetch(
      `${API_SERVER_URL}api/v1/project/deploy/${DEPLOYMENT_ID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_TOKEN}`,
        },
        body: JSON.stringify({ status }),
      }
    );
    console.log(res);
  } catch (error) {
    console.log("Status Updation failed");
    console.log(error.message);
  }
};

const s3client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
let error = false;



function buildCode(outdirpath) {
  return new Promise((resolve, reject) => {
     const p = exec(`cd ${outdirpath} && npm install && npm run build`, (error) => {
          if (error) {
              reject(error);
          }
          resolve("Built");
      });
      p.stdout.on("data", async (data) => {
        publishLog(data.toString());
        console.log(data.toString());
      });
      p.stdout.on("error", async (data) => {
        console.log("p.stdout.on error")
        error = true;
        publishLog(`Error: ${data.toString()}`);
        console.log("Error:" + data.toString());
        await updateDeploymentStatus("FAILED");
        process.exit(1);
      });
      p.stdout.on("close", async () => {
        if (!error) {
          console.log("Build completed successfully");
          publishLog("Build completed successfully");
        } else {
          console.log("Error: Build Failed");
          publishLog(`Error: Build failed`);
          process.exit(1);
        }
    
        const folderPath = path.join(__dirname, "output", "dist");
        const distFolderContent = fs.readdirSync(folderPath, { recursive: true });
    
        for (const file of distFolderContent) {
          const filePath = path.join(folderPath, file);
          if (fs.lstatSync(filePath).isDirectory()) continue;
          publishLog("Deployment Started!");
          console.log("Uploading " + filePath);
          publishLog(`Uploading ${file}`);
          const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `outputs/${PROJECT_ID}/${file}`,
            Body: fs.createReadStream(filePath),
            ContentType: mimetypes.lookup(filePath),
          });
          try {
            await s3client.send(command);
          } catch (err) {
            console.error(`Error uploading ${file}: ${err}`);
            publishLog(`Error uploading ${file}: ${err}`);
            process.exit(1);
          }
        }
    
        publishLog(`Deployed 🎉`);
        console.log("Deployed");
        await updateDeploymentStatus("DEPLOYED");
        process.exit(0);
      });
  })
}


async function init() {
  await updateDeploymentStatus("IN_PROGRESS");
  console.log("Building project");
  publishLog("Building project...");
  const outdirpath = path.join(__dirname, "output");
  try {
    await buildCode(outdirpath)
  } catch (err) {
    error = true;
    publishLog(`${err.toString()}`);
    console.log("Error:" + err.toString());
    await updateDeploymentStatus("FAILED");
    process.exit(1);
  }
}
init();
