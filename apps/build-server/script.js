const {exec} = require("child_process")
const path = require("path");
const fs = require("fs");
const mimetypes = require("mime-types");
const {S3Client,PutObjectCommand} = require("@aws-sdk/client-s3")
const dotenv = require("dotenv");
dotenv.config();

const s3client = new S3Client({
    region:process.env.AWS_REGION,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
    }
})
const PROJECT_ID = process.env.PROJECT_ID;
async function init()
{
    console.log("Executing script.js");
    const outdirpath = path.join(__dirname,"output");
    const p = exec(`cd ${outdirpath} && npm install && npm run build`)
    p.stdout.on("data",(data)=>{
        console.log(data.toString())
    })

    p.stdout.on("error",(data)=>{
        console.log("Error:"+data.toString())
    })
    p.stdout.on("close",async ()=>{
        console.log("Build completed")
        const folderPath = path.join(__dirname,"output","dist");
        const distFolderContent = fs.readdirSync(folderPath,{recursive:true});
        for(const file of distFolderContent ){
            const filePath = path.join(folderPath,file)
            if(fs.lstatSync(filePath).isDirectory())
                continue
            console.log("Uploading "+filePath);
            const command = new PutObjectCommand({
                Bucket:process.env.AWS_BUCKET_NAME,
                Key:`outputs/${PROJECT_ID}/${file}`,
                Body:fs.createReadStream(filePath),
                ContentType:mimetypes.lookup(filePath)
            })
            await s3client.send(command);
        }
    })
  
}
init();