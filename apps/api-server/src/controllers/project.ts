import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { getECSConfig, getRunTaskConfig } from "../aws/ECSconfig";
const PORT = process.env.PORT;
const prismaClient = new PrismaClient();

interface AuthRequest extends Request {
  headers: {
      authorization?: string; 
  };
  userId?:any
}
export const createProject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { gitUrl, projectName } = req.body;
    const userId = req.userId;
    const project = await prismaClient.project.create({
      data: {
        projectName,
        gitUrl,
        userId
      },
    });
    res
      .status(200)
      .json(
        new ApiResponse(200, "Project created successfully", { projectId:project.id }, true)
      );
  }
);
export const deployProject = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = req.params.projectId;
    const project = await prismaClient.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) throw new ApiError(404, "Project not found");
    const deployment = await prismaClient.deployment.create({
      data:{
        projectId: projectId,
        status:"QUEUED"
      }
    })

    const ecsClient = new ECSClient(getECSConfig());
    const command = new RunTaskCommand(
      getRunTaskConfig(project.gitUrl, project.projectName)
    );
    await ecsClient.send(command);
    res.json({
      message: "QUEUED",
      data: {url:`http://${project.projectName}.localhost:${PORT}`,deploymentId:deployment.id},
    });
  }
);

export const getAllProjects = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const userIdProvided = req.params.userId;
    if(userId!==userIdProvided){
      throw new ApiError(403, "Forbidden");
    }
    const projects = await prismaClient.project.findMany({
      where:{
        userId
      }
    })
    res
      .status(200)
      .json(
        new ApiResponse(200, "Fetched Projects", { projects }, true)
      );
  }
);