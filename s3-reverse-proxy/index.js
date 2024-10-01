const express = require("express");
const httpProxy = require("http-proxy");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000
const proxy = httpProxy.createProxy();

app.use((req,res)=>{
    const url = req.hostname;
    const subdomain = url.split(".")[0];
    const AWS_BUCKET_URL = process.env.AWS_BUCKET_URL;
    const resolvesTo = `${AWS_BUCKET_URL}/${subdomain}`

    proxy.web(req,res,{
        target:resolvesTo,
        changeOrigin:true
    })
})
proxy.on("proxyReq",(proxyReq,req,res)=>{
    if(req.url==="/")
        proxyReq.path+="index.html"
})
app.listen(PORT,()=>{
    console.log("Server running at PORT "+PORT);
})