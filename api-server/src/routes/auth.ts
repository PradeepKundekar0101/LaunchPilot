import express from 'express';

import passport from 'passport';
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "";



const router = express.Router();
router.get('/github', passport.authenticate("github"));
router.get('/github/callback',passport.authenticate('github', { session: false }), (req, res) => {
    const token = generateToken(req.user);
    res.json({ token }); 
  });


export default router

const generateToken = (user: any) => {
    return jwt.sign(
      {
        id: user._id, // Payload (user ID)
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Set token expiration time
    );
  };
  