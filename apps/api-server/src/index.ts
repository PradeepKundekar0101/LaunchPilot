import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { Server } from "socket.io";
import Redis from "ioredis";

import projectRoute from './routes/project'
import userRoute from './routes/user'

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
    io.to(channel).emit("message",message);
  })
}
initSubscriber();

app.use(express.json());
app.use(cors({origin:"*"}))
app.use("/api/v1/project",projectRoute)
app.use("/api/v1/user",userRoute)


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
