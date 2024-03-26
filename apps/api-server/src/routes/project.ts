import express from "express";
import {createProject,deployProject} from '../controllers/project'
import { validateProject } from "../middleware/zodValidators";
import { authenticateToken } from "../middleware/auth";
const router = express.Router();
router.post("/",authenticateToken,validateProject,createProject);
router.post("/deploy",authenticateToken,deployProject);
export default router
