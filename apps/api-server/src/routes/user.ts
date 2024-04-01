import express from 'express';
import { registerUser,loginUser,changePassword } from '../controllers/user';
import { userSchema } from '../validationSchema/user';
import { validateUserRegistration } from '../middleware/zodValidators';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
router.post('/register', validateUserRegistration(userSchema), registerUser);
router.post('/login',loginUser);
router.post("/changepassword/:userId", authenticateToken , changePassword);
router.get("/checkAuth",)

export default router