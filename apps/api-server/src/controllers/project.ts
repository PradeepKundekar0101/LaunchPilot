import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

const prismaClient = new PrismaClient();

export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { gitUrl, projectName } = req.body;
    const project = await prismaClient.project.create({
      data: {
        projectName,
        gitUrl,
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
    res.status(200).json(new ApiResponse(200, "QUEUE", "", true));
  }
);
