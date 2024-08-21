

import { Request,Response } from "express";
import expressAsyncHandler from "express-async-handler";
import {deleteFromCloudinary, uploadOnCloudinary} from "../cloudynary/video"
import db from "../db/db";


interface variableRequest extends Request{
    userId?: string
}

const uploadImageToDb = expressAsyncHandler(async (req:variableRequest, res: Response): Promise<void> => {
    try {
      // @ts-ignore
      const imagePath = req.files?.imagePath[0].path;

      console.log("this is the video",imagePath)
      const { title, description } = req.body;
      console.log(req.body)
      console.log(req.userId)
      if (!imagePath || !title || !description) {
        throw new Error("image, title, and description are required");
      }
  
      const image = await uploadOnCloudinary(imagePath);
      console.log("This is image:", image);
  
      if (!image) {
        throw new Error("An error occurred while uploading the image");
      }
  
      const insertText = `INSERT INTO images (image_public_id, image_url, title, description, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
      const valueText = [image?.public_id, image?.url, title, description, req.userId];
  
      const createdVideo = await db.query(insertText, valueText);
  
      if (!createdVideo) {
        throw new Error("Error while inserting to database");
      }
  
      res.status(200).json({ image_url: image.url, image_public_id: image.public_id });
      return ;
    } catch (error) {
      console.log("Error occurred while uploading:", error);
      throw new Error("error occur while uploading to db") // Pass the error to the next middleware or error handler
    }
  });



  const updateImageFromDb = expressAsyncHandler(
    async (req: variableRequest, res: Response): Promise<void> => {
      try {
        // @ts-ignore
        const imagePath = req.files?.imagePath[0].path;

        console.log("this is the image",imagePath)
        const { title, description } = req.body;
        console.log(req.body)
        const imageId = req.params.imageId;
        const userId = req.userId;
        console.log(title, description, imageId, userId);
  
        if (!title || !description || !imageId || !userId || !imagePath) {
          res
            .status(400)
            .json({
              error: "title , description, imageId and userId is required",
            });
          return;
        }
  
        const imageQuery = `SELECT * FROM images WHERE id=$1 AND owner_id = $2 `;
        const imageValue = [imageId, userId];
  
        const foundImage = await db.query(imageQuery, imageValue);
  
        if (foundImage.rowCount === 0) {
          res.status(404).json({ error: "image not found" });
          return;
        }
  
        const { image_url, image_public_id } = foundImage.rows[0];
  
        const deleteImageCl = await deleteFromCloudinary(
          image_url,
          image_public_id
        );
  
        if (!deleteImageCl) {
          res.send("image is not delete");
          return;
        } else {
          const updateImageDetail = await uploadOnCloudinary(imagePath);
  
          //   const updateText = `UPDATE videos SET title = $1, description = $2 WHERE id = $3 AND owner_id = $4 RETURNING id`;
          //  const valueText = [title, description, videoId, userId]
  
          if (!updateImageDetail) {
            res.send("image is not update");
            return;
          }
  
          const updateQuery = `UPDATE images SET title=$1, description=$2, image_public_id=$3, image_url=$4, updated_at=NOW()
      WHERE id=$5 AND owner_id=$6
    `;
          const updateValues = [
            title,
            description,
            updateImageDetail?.public_id,
            updateImageDetail?.url,
            imageId,
            userId,
          ];
          await db.query(updateQuery, updateValues);
  
          const result = await db.query(updateQuery, updateValues);
          console.log("updated result", result.rows);
  
          if (result.rowCount === 0) {
            res
              .status(404)
              .json({
                error:
                  "No matching image found or you do not have permission to update this image",
              });
            return;
          }
  
          res.status(200).json({ updatedVideoId: result.rows[0].id });
        }
      } catch (error) {
        console.log("error while updating", error);
        throw new Error("an error occured while updating");
      }
    }
  );


  const getAllimages = expressAsyncHandler(async (req, res) => {
    try {
      const images = [];
      console.log("I reached here");
      const result = await db.query(` SELECT 
      images.id,
      images.image_public_id, 
      images.image_url, 
      images.title, 
      images.description, 
      images.created_at,
      images.updated_at,
      my_users.username, 
      my_users.email 
    FROM images
    JOIN my_users ON images.owner_id = my_users.id`);
      console.log("result", result);
      if (!result) {
        res.status(404).json({ error: "no image found" });
        return;
      }
  
      console.log("image are", result.rows[0]);
      // for (let i = 0; i < result.resources.length; i++) {
      //   videoUrl.push(result.resources[i].url)
      // }
      res.json({ imagegDetail: result.rows });
      return;
    } catch (error) {
      console.log("error while getting All image", error);
      throw new Error("an error occured while getting All image");
    }
  });
  

  const getOneimage = expressAsyncHandler(async (req, res) => {
    try {
      console.log("I reached here");
      const imageId = req.params.imageId;
  
      console.log("this is", imageId);
      if (!imageId) {
        res.status(400).json({ error: "imageId is required" });
        return;
      }
  
      const imageText = `SELECT image_url, title , description FROM images WHERE id =$1`;
      const value = [imageId];
  
      const getImage = await db.query(imageText, value);
  
      if (!getImage) {
        res.status(404).json({ error: "no image found" });
        return;
      }
  
      res.status(200).json({ imageDetails: getImage.rows });
    } catch (error) {
      console.log("error while getting image", error);
      throw new Error("an error occured while getting image");
    }
  });


  const deletImage = expressAsyncHandler(async(req: variableRequest, res: Response): Promise<void>=>{


    try {
      const userId = req.userId;
      const imageId = req.params.imageId;
      console.log(userId, imageId);
      if (!imageId || !userId) {
        res.status(400).json({ error: "imageId and userId is required" });
        return;
      }
  
      const deletTextforClodinary = `SELECT image_url, image_public_id FROM images WHERE id = $1 AND owner_id = $2`;
  
      const deleteValue = [imageId, userId];
  
      const result = await db.query(deletTextforClodinary, deleteValue);
  
      if (result.rowCount === 0) {
        res
          .status(404)
          .json({
            error:
              "No image found or you do not have permission to delete this image",
          });
        return;
      }
  
      const imageDetails = result.rows[0];
      const publicId: string = imageDetails.image_public_id;
      const mediaUrl: string = imageDetails.image_url;
  
      const resultOfCloudinary = await deleteFromCloudinary(mediaUrl, publicId);
  
      const deleteTextForDb = `DELETE FROM images WHERE id = $1 AND owner_id = $2 RETURNING id`;
      const deleteResult = await db.query(deleteTextForDb, deleteValue);
  
      if (deleteResult.rowCount === 0) {
        res.status(404).json({ error: "No image found to delete" });
        return;
      }
  
      res
        .status(200)
        .json({
          message: "image deleted successfully",
          videoId: deleteResult.rows[0].id,
          cloudinaryDelete: resultOfCloudinary,
        });
      return;
    }
    
    catch (error) {
      console.log("an error occured while deleting image",error);
      throw new Error("an error occured while updating");
    }
  })


export {updateImageFromDb, uploadImageToDb,deletImage,getAllimages, getOneimage}


// posts route which include usedetail photos and videos


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
      url: row.image_url,
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
      url: row.video_url,
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

    res.json(posts);
  } catch (error) {
    
    console.log("error while fetching posts",error);
    throw new Error("Error while fetching the post");

  }
})

