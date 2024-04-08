import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { Server } from "socket.io";
import Redis from "ioredis";
import { uuid } from "uuidv4";
import {cassandraClient} from './services/cassandraClient'
import projectRoute from './routes/project'
import userRoute from './routes/user'


dotenv.config();
const PORT = process.env.PORT || 8000;
const SOCKET_PORT = Number(process.env.SOCKET_PORT) || 8001;
const REDIS_URI= process.env.REDIS_URI||"";
let deploymentId="";

cassandraClient.connect().then(()=>{
  console.log("Cassandra Client connected Successfully!");
  cassandraClient.execute(`
    CREATE TABLE IF NOT EXISTS default_keyspace.Logs (
    event_id UUID,
    deploymentId UUID,
    log text,
    timestamp timestamp,
    PRIMARY KEY (event_id)
    );
  `)
  .then(result => {
      console.log("Table created");
  })
  .catch(error => {
    console.error("Error executing query:", error.message);
  });
}).catch((e:Error)=>{
  console.log(e.message);
})

const app = express();
app.get("/",(req,res)=>{
  res.send("Hello from launch pilot");
})

const io = new Server();
const subscriber = new Redis(REDIS_URI);

const initSubscriber = async ()=>{
  subscriber.psubscribe("logs:*");
  subscriber.on("pmessage",async (pattern:string,channel:string,message:string)=>{
    io.to(channel).emit("message",message);
    deploymentId = channel.split(":")[1];
    try {
      await cassandraClient.execute(
        `INSERT INTO default_keyspace.Logs (event_id, deploymentId, log, timestamp) VALUES (?, ?, ?, toTimestamp(now()));`,
        [uuid(), deploymentId, message]
    );
    console.log("Inserted");
    } catch (error:any) {
      console.log(error.message)
    }
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
    console.log("Joining channel:"+channel)
    socket.join(channel);
    deploymentId = channel.split(":")[1];
    // socket.emit("message",JSON.stringify({log:`Joined ${channel}`}));
  })
})

io.listen(SOCKET_PORT)
