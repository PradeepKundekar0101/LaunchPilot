import { Request, Response } from "express";

import express from "express";
import randomWord from "random-word-slugs";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { getRunTaskConfig, getECSConfig } from "./config";


dotenv.config();
const PORT = process.env.PORT || 8000;
const SOCKET_PORT = Number(process.env.SOCKET_PORT) || 8001;
const REDIS_URI= process.env.REDIS_URI||"";

const app = express();

const io = new Server();

const subscriber = new Redis(REDIS_URI);

const initSubscriber = async ()=>{

  subscriber.psubscribe("logs:*");
  subscriber.on("pmessage",(pattern:string,channel:string,message:string)=>{
    console.log("channel: "+channel);
    console.log("message:" +message);
    io.to(channel).emit("message",message);
  })
}
initSubscriber();

app.use(express.json());
app.use("/api/v1/project",)

app.post("/deploy", async (req:Request, res:Response) => {
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

io.on("connection",(socket:any) =>{
  socket.on("subscribe",(channel:string)=>{
    socket.join(channel);
    socket.emit("message",`Joined ${channel}`);
  })
})

io.listen(SOCKET_PORT)
