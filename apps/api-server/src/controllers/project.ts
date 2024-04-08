import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { getECSConfig, getRunTaskConfig } from "../aws/ECSconfig";
import { cassandraClient } from "../services/cassandraClient";
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
    const existingProject = await prismaClient.project.findFirst({
      where:{
        projectName
      }
    })
    if(existingProject){
      throw new ApiError(400,"Project with this name already exists");
    }
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
    const token  = req.headers.authorization?.split(" ")[1];
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
      getRunTaskConfig(project.gitUrl, project.projectName,deployment.id,token!)
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
export const getDeploymentsByProjectID = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const projectId = req.params.projectId;
    const deployments = await prismaClient.deployment.findMany({
      where:{
        projectId
      }
    })
    res
      .status(200)
      .json(
        new ApiResponse(200, "Fetched Deployments", { deployments }, true)
      );
  }
);

export const changeStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {

    const deploymentId = req.params.deployId;
    const status = req.body.status;
    const updatedDeployment = await prismaClient.deployment.update({
      where:{
        id:deploymentId
      },
      data:{
        status
      }
    })
    res
      .status(200)
      .json(
        new ApiResponse(200, "Status updated", { updatedDeployment }, true)
      );
  }
);


export const checkProjectExists = asyncHandler(
  async (req: AuthRequest, res: Response) => {

    const projectId = req.params.projectId;

    const exists = await prismaClient.project.findFirst({
      where:{
        id:projectId
      }
    })
    if(exists)
      throw new ApiError(400,"Project Already exists");
    res
      .status(200)
      .json(
        new ApiResponse(200, "Project does not exists",  {}, true)
      );
  }
);

export const getLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const deployId = req.params.deployId;

  const exists = await prismaClient.deployment.findUnique({
      where: {
          id: deployId
      }
  });
  if (!exists) {
      throw new ApiError(404, "Deployment does not exist");
  }

  try {
      const result = await cassandraClient.execute(`
          SELECT * FROM default_keyspace.Logs WHERE deploymentId = ? ALLOW FILTERING;
      `, [deployId]);
      

      const logs = result.rows.map(row => row.log);
      
      res.status(200).json(new ApiResponse(200, "Logs retrieved successfully", { logs }, true));
  } catch (error:any) {
      console.error("Error retrieving logs:", error.message);
      throw new ApiError(500, "Internal Server Error");
  }
});
