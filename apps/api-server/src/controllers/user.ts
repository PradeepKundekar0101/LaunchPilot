import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET||"";
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, userName, password } = req.body;
    if (!email || !password || !userName)
      throw new ApiError(400, "All fields are required");

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new ApiError(409, "User with email already exists");
    }
    const hashPass = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        userName,
        email,
        password: hashPass,
      },
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    if (!user)
      throw new ApiError(500, "Something went wrong while creating a user");
    return res
      .status(201)
      .json(new ApiResponse(201, "User created", { user, token }, true));
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "All fields are required");

  const existedUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!existedUser) {
    throw new ApiError(400, "Invalid credentials");
  }

  const passwordCorrect = await bcrypt.compare(password, existedUser.password);
  if (!passwordCorrect) throw new ApiError(400, "Invalid credentials");
  const token = jwt.sign({ id: existedUser.id }, JWT_SECRET, {
    expiresIn: "7D",
  });
  return res
    .status(201)
    .json(
      new ApiResponse(201, "User logged in", { user: existedUser, token }, true)
    );
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { curPassword, newPassword } = req.body;
  if (!curPassword || !newPassword) throw new ApiError(400, "All fields are required");
  const userId = req.params.userId;
  const existedUser = await prisma.user.findUnique({
    where: {
      id:userId
    },
  });
  if (!existedUser) {
    throw new ApiError(404, "User not found");
  }
  const passwordCorrect = await bcrypt.compare(curPassword, existedUser.password);
  if (!passwordCorrect) throw new ApiError(400, "Invalid current password");  
  const hashNewPassword = await bcrypt.hash(newPassword,10);
  await prisma.user.update({
    where:{
      id:userId
    },data:{
      password:hashNewPassword
    }
  })
  return res
    .status(201)
    .json(
      new ApiResponse(201, "Password Changed", { message: "Success" }, true)
    );
});