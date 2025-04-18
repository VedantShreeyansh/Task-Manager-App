import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Access Denied, No Token Provided" });
      return;
    }
  
    const token = authHeader.split(" ")[1];
  
    try {
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing in environment variables!");
        res.status(500).json({ message: "Internal Server Error: Missing JWT Secret" });
        return;
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
      req.user = { userId: decoded.userId };
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error);
      res.status(403).json({ message: "Invalid Token" });
    }
  };