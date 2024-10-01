import express from 'express';
// import { registerUser,loginUser,changePassword,verifyToken,sendToken } from '../controllers/user';
import { userSchema } from '../validationSchema/user';
import { validateUserRegistration } from '../middleware/zodValidators';
import { isAuthenticated } from '../middleware/auth';


const router = express.Router();
// router.post('/register', validateUserRegistration(userSchema), registerUser);
// router.post('/login',loginUser);
// router.post("/changepassword/:userId", isAuthenticated , changePassword);
// router.get("/verify/:userId/token/:token",isAuthenticated,verifyToken)
// router.get("/sendEmailToken/:userId",isAuthenticated,sendToken)



export default router