
import {Request, Response, NextFunction } from 'express'
import expressAsyncHandler = require("express-async-handler");
import { verify } from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
    userId?: string;
  }
  
  const userMiddleware = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    
    const jwtToken = req.headers['authorization'];
    console.log(jwtToken);
  
    if (!jwtToken || typeof jwtToken !== 'string') {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const secret = process.env.MY_SECRET;
    if (!secret) {
      res.status(404).json({ error: "Secret not found" });
      return;
    }
  
    
    let payload:any;
    try {
      payload = verify(jwtToken , secret);
      
    } catch (error) {
      res.status(401).json({ error: "Unauthorized! Invalid token" });
      return;
    }
  
    if (!payload) {
      res.status(401).json({ error: "Unauthorized! No payload" });
      return;
    }
  
    req.userId = payload.userId;
   
    next();
  });


  export default userMiddleware;