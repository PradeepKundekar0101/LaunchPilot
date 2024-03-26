import express from "express";
import {createProject,deployProject} from '../controllers/project'
export const router = express.Router();
router.post("/",createProject);
router.post("/deploy",deployProject);

