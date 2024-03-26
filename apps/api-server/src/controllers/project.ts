import { Request, Response } from "express"
import { asyncHandler } from "../utils/AsyncHandler"

export const createProject = asyncHandler(async(req:Request,res:Response)=>{
    const {gitUrl,projectName} = req.body;
})
export const deployProject = ()=>{
    
}