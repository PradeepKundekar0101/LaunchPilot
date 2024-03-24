const express = require("express");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const randomWord = require("random-word-slugs");
const dotenv = require("dotenv");
const { getRunTaskConfig, getECSConfig } = require("./config");
dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());

app.post("/deploy", async (req, res) => {
  const { gitUrl } = req.body;
  const projectId = randomWord.generateSlug();
  const ecsClient = new ECSClient(getECSConfig());
  const command = new RunTaskCommand(getRunTaskConfig(gitUrl));
  await ecsClient.send(command);
  res.json({message:"QUEUED",data:`http://${projectId}.localhost:${PORT}`});
});
app.listen(PORT, () => {
  console.log("API server running at port " + PORT);
});
