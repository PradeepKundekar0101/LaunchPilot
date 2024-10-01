import express from "express";
import {createProject,deployProject,getAllProjects,changeStatus,getDeploymentsByProjectID,getLogs} from '../controllers/project'
import { validateProject } from "../middleware/zodValidators";
import { isAuthenticated } from "../middleware/auth";
import { projectSchema } from "../validationSchema/project";

const router = express.Router();
const validateProjectDetails = ()=>{
   return validateProject(projectSchema);
}

router.get("/:userId",isAuthenticated,getAllProjects);
router.get("/deploy/:projectId",isAuthenticated,getDeploymentsByProjectID);
router.post("/",isAuthenticated,validateProjectDetails(),createProject);
router.post("/deploy/:projectId",isAuthenticated,deployProject);
router.put("/deploy/:deployId",isAuthenticated,changeStatus);
router.get("/deploy/logs/:deployId",isAuthenticated,getLogs);

export default router
