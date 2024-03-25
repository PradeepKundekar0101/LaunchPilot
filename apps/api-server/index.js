const express = require("express");
const randomWord = require("random-word-slugs");
const dotenv = require("dotenv");
const socketio = require("socket.io");
const redis = require("ioredis");
const http = require("http");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const { getRunTaskConfig, getECSConfig } = require("./config");

dotenv.config();
const PORT = process.env.PORT || 8000;
const REDIS_URI= process.env.REDIS_URI;

const app = express();
const httpServer = http.createServer();
const io = new socketio.Server({cors:"*"});

const subscriber = new redis.Redis(REDIS_URI);

const initSubscriber = async ()=>{

  subscriber.psubscribe("logs:*");
  subscriber.on("pmessage",(pattern,channel,message)=>{
    console.log("channel: "+channel);
    console.log("message:" +message);
    io.to(channel).emit("message",message);
  })
}
initSubscriber();

app.use(express.json());

app.post("/deploy", async (req, res) => {
  const { gitUrl } = req.body;
  const projectId = randomWord.generateSlug();
  const ecsClient = new ECSClient(getECSConfig());
  const command = new RunTaskCommand(getRunTaskConfig(gitUrl,projectId));
  await ecsClient.send(command);
  res.json({message:"QUEUED",data:`http://${projectId}.localhost:${PORT}`});
});
app.listen(PORT, () => {
  console.log("API server running at port " + PORT);
});

io.on("connection",socket=>{
  socket.on("subscribe",(channel)=>{
    socket.join(channel);
    socket.emit("message",`Joined ${channel}`);
  })
})

io.listen(process.env.SOCKET_PORT||8001,()=>{
  console.log("Socket server started");
})
