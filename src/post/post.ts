
import { Request,Response } from "express";
import expressAsyncHandler from "express-async-handler";
import db from "../db/db";

interface variableRequest extends Request{
  userId?: string
}



export const postInfo = expressAsyncHandler(async(req,res)=>{

    try {
      // Fetch image details
     
      const imageResult = await db.query(`
        SELECT 
          images.id AS image_id,
          images.image_public_id, 
          images.image_url, 
          images.title AS image_title, 
          images.description AS image_description, 
          images.created_at AS image_created_at,
          images.updated_at AS image_updated_at,
          my_users.username, 
          my_users.email 
        FROM images
        JOIN my_users ON images.owner_id = my_users.id
      `);
  
      // Fetch video details
      const videoResult = await db.query(`
        SELECT 
          videos.id AS video_id,
          videos.video_public_id, 
          videos.video_url, 
          videos.title AS video_title, 
          videos.description AS video_description, 
          videos.created_at AS video_created_at,
          videos.updated_at AS video_updated_at,
          my_users.username, 
          my_users.email 
        FROM videos
        JOIN my_users ON videos.owner_id = my_users.id
      `);
  
      // Combine results
      const images = imageResult.rows.map(row => ({
        type: 'image',
        id: row.image_id,
        publicId: row.image_public_id,
        image_url: row.image_url,
        title: row.image_title,
        description: row.image_description,
        createdAt: row.image_created_at,
        updatedAt: row.image_updated_at,
        username: row.username,
        email: row.email
      }));
  
      const videos = videoResult.rows.map(row => ({
        type: 'video',
        id: row.video_id,
        publicId: row.video_public_id,
        video_url: row.video_url,
        title: row.video_title,
        description: row.video_description,
        createdAt: row.video_created_at,
        updatedAt: row.video_updated_at,
        username: row.username,
        email: row.email
      }));
  
      // Combine both arrays
      const posts = [...images, ...videos];
  
     
      // Sort by upload time (createdAt)
      // @ts-ignore
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  

      res.json({post:posts});
    } catch (error) {
      
      console.log("error while fetching posts",error);
      throw new Error("Error while fetching the post");
  
    }
  })



  export const userPost = expressAsyncHandler(async (req:variableRequest, res: Response): Promise<void> =>{

    try {
      const userId = req.userId

      const imageResult = await db.query(
        `
        SELECT 
          images.id AS image_id,
          images.image_public_id, 
          images.image_url, 
          images.title AS image_title, 
          images.description AS image_description, 
          images.created_at AS image_created_at,
          images.updated_at AS image_updated_at,
          my_users.username
        FROM images
        JOIN my_users ON images.owner_id = my_users.id
        WHERE images.owner_id = $1
        `,
        [userId] // Assuming userId is a variable containing the user's ID
      );

      const videoResult = await db.query(
        `
        SELECT 
          videos.id AS video_id,
          videos.video_public_id, 
          videos.video_url, 
          videos.title AS video_title, 
          videos.description AS video_description, 
          videos.created_at AS video_created_at,
          videos.updated_at AS video_updated_at,
          my_users.username
        FROM videos
        JOIN my_users ON videos.owner_id = my_users.id
        WHERE videos.owner_id = $1
        `,
        [userId]
      );



      const images = imageResult.rows.map(row => ({
        type: 'image',
        id: row.image_id,
        publicId: row.image_public_id,
        image_url: row.image_url,
        title: row.image_title,
        description: row.image_description,
        createdAt: row.image_created_at,
        updatedAt: row.image_updated_at,
        username: row.username,
      }));
  
      const videos = videoResult.rows.map(row => ({
        type: 'video',
        id: row.video_id,
        publicId: row.video_public_id,
        video_url: row.video_url,
        title: row.video_title,
        description: row.video_description,
        createdAt: row.video_created_at,
        updatedAt: row.video_updated_at,
        username: row.username,
      }));
  
      const posts = [...images, ...videos];
  
      // Sort by upload time (createdAt)
      // @ts-ignore
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
      res.json({post:posts});
      return  
    } catch (error) {
        console.log("error while fetching userPost",error);
        throw new Error("Error while fetching the userPost");
    }

  })


