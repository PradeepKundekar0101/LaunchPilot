import express from "express";
import {createProject,deployProject,getAllProjects} from '../controllers/project'
import { validateProject } from "../middleware/zodValidators";
import { authenticateToken } from "../middleware/auth";
import { projectSchema } from "../validationSchema/project";

const router = express.Router();
const validateProjectDetails = ()=>{
   return validateProject(projectSchema);
}
router.post("/",authenticateToken,validateProjectDetails(),createProject);
router.post("/deploy/:projectId",authenticateToken,deployProject);
router.get("/:userId",authenticateToken,getAllProjects);
export default router
