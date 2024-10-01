import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or wrong format' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};
