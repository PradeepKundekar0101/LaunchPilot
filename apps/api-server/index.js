const express = require("express");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const randomWord = require("random-word-slugs");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());

app.post("/deploy", async (req, res) => {
  const { gitUrl } = req.body;
  const projectId = randomWord.generateSlug();
  const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const command = new RunTaskCommand({
    count: 1,
    cluster: process.env.AWS_ECS_CLUSTER_ARN,
    taskDefinition: process.env.AWS_ECS_TASK_ARN,
    launchType:"FARGATE",
    overrides: {
      containerOverrides: [
        {
          name: "build-server",
          environment: [
            {
              name: "AWS_SECRET_ACCESS_KEY",
              value: process.env.AWS_SECRET_ACCESS_KEY,
            },
            {
              name: "AWS_ACCESS_KEY",
              value: process.env.AWS_ACCESS_KEY,
            },
            {
              name: "AWS_REGION",
              value: process.env.AWS_REGION,
            },
            {
                name:"AWS_BUCKET_NAME",
                value:process.env.AWS_BUCKET_NAME
            },
            {
                name:"PROJECT_ID",
                value:projectId
            },
            {
                name:"GIT_REPO_URL",
                value:gitUrl
            }
          ],
        },
      ],
    },
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          process.env.AWS_ECS_SUB1,
          process.env.AWS_ECS_SUB2,
          process.env.AWS_ECS_SUB3,
        ],
        securityGroups: [process.env.AWS_ECS_SG],
      },
    },
  });
  await ecsClient.send(command);
  res.json({message:"QUEUED",data:`http://${projectId}.localhost:${PORT}`});
});
app.listen(PORT, () => {
  console.log("API server running at port " + PORT);
});
