
import dotenv from 'dotenv'
import { Router } from 'express';
import db from '../db/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { JwtPayload } from "jsonwebtoken";  
import { Request,Response } from "express";
import userMiddleware from '../midleware/user';
dotenv.config({path:'../../.env'})

console.log(dotenv.config({path:'./.env'}))
const userRouter = Router();


interface variableRequest extends Request{
  userId?: string
}
// src/userAuth/Auth.ts
 // Adjust the path as needed
 

const router = Router();

const saltRounds =10;

userRouter.post('/signup', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { username, email, password } = req.body;

    // Check if all required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the user already exists
    const existingUserResult:any = await db.query('SELECT * FROM my_users WHERE email = $1;', [email]);

    if (existingUserResult.rowCount > 0) {
      console.log('Existing user:', existingUserResult.rows[0]);
      return res.status(400).json({ warning: 'User with this email already exists' });
    }

    const hashedPassword =await bcrypt.hash(password, saltRounds);
    console.log("hashed pass", hashedPassword)
    
    // Insert the new user into the database
    const insertText = 'INSERT INTO my_users (username, email, password) VALUES ($1, $2, $3) RETURNING id';
    const insertValues = [username, email, hashedPassword];
    const insertResult:any = await db.query(insertText, insertValues);

    // Check if the insert was successful
    if (insertResult.rowCount > 0) {
      const userId = insertResult.rows[0].id;
      console.log("User signed up successfully:", insertResult.rows[0]);

      const secret = process.env.MY_SECRET;
      if(!secret){
        throw new Error('JWT secret is not defined');
      }

      const token = jwt.sign({userId},secret as string);
      return res.status(201).json({
        message: "User signed up successfully",
        userId,
        token,
      });
    } else {
      return res.status(500).json({ error: 'Failed to sign up user' });
    }
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ error: 'An error occurred while signing up' });
  }
});


userRouter.post("/signin",async(req,res)=>{
  try {
    
    console.log('Request body:', req.body);
    const { email, password } = req.body;
  
    // Check if all required fields are provided
    if ( !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const selectText = 'SELECT * FROM my_users WHERE email = $1';
    const selectValues = [email];
    const result:any = await db.query(selectText, selectValues);
    
    if (result.rowCount > 0) {
      const user = result.rows[0];
      const userId = user.id;
      const secret = process.env.MY_SECRET;
      if(!secret){
        throw new Error('JWT secret is not defined');
      }

      await bcrypt.compare(password, user.password);


      const token = jwt.sign({userId},secret as string);
      return res.status(201).json({
        message: "User signed in successfully",
        userId,
        token,
      });
    } else {
      console.log("User not found");
    }
  } catch (error) {
    console.error('Error during signin:', error);
    return res.status(500).json({ error: 'An error occurred while signing in' });
  }
})

userRouter.get('/logout',userMiddleware, async (req: variableRequest, res: Response): Promise<void> => {
  try {
    // Extract token from authorization header
    const jwtToken = req.headers['authorization'];

    
    if (!jwtToken || typeof jwtToken !== 'string') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const secret = process.env.MY_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'JWT secret not found' });
      return;
    }
    
    const decoded = jwt.verify(jwtToken, secret as string) as JwtPayload;


    if (req.userId === decoded.userId) {
     
      req.userId = undefined;
      res.status(200).json({ message: 'Logout successful, token invalidated.' });
    } else {
      res.status(401).json({ error: 'Token is invalid or does not match' });
    }
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'An error occurred during logout' });
  }
});


export default userRouter;
