import express from 'express';
import { registerUser,loginUser,changePassword } from '../controllers/user';
import { userSchema } from '../validationSchema/user';
import { validateUserRegistration } from '../middleware/zodValidators';

const router = express.Router();
router.post('/register', validateUserRegistration(userSchema), registerUser);
router.post('/login',loginUser);
router.post("/changepassword/:userId",changePassword);

export default router