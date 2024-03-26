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
        new ApiResponse(200, "Project created successfully", { project }, true)
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

    const ecsClient = new ECSClient(getECSConfig());
    const command = new RunTaskCommand(
      getRunTaskConfig(project.gitUrl, project.projectName)
    );
    await ecsClient.send(command);
    res.json({
      message: "QUEUED",
      data: `http://${projectId}.localhost:${PORT}`,
    });
  }
);
