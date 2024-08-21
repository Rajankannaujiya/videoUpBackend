import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../cloudynary/video";
import db from "../db/db";
import { Console } from "console";

interface variableRequest extends Request {
  userId?: string;
}

const uploadVideoToDb = expressAsyncHandler(
  async (req: variableRequest, res: Response): Promise<void> => {
    try {
      // @ts-ignore
      const videoPath = req.files?.videoPath[0].path;

      console.log("this is the video", videoPath);
      const { title, description } = req.body;
      console.log(req.body);
      console.log(req.userId);
      if (!videoPath || !title || !description) {
        throw new Error("Video, title, and description are required");
      }

      const video = await uploadOnCloudinary(videoPath);
      console.log("This is video:", video);

      if (!video) {
        throw new Error("An error occurred while uploading the video");
      }

      const insertText = `INSERT INTO videos (video_public_id, video_url, title, description, duration, owner_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
      const valueText = [
        video?.public_id,
        video?.url,
        title,
        description,
        video?.duration,
        req.userId,
      ];

      const createdVideo = await db.query(insertText, valueText);

      if (!createdVideo) {
        throw new Error("Error while inserting to database");
      }

      res
        .status(200)
        .json({ video_url: video.url, video_publicId: video.public_id });
      return;
    } catch (error) {
      console.log("Error occurred while uploading:", error);
      throw new Error("error occur while uploading to db"); // Pass the error to the next middleware or error handler
    }
  }
);

const updateVideoFromDb = expressAsyncHandler(
  async (req: variableRequest, res: Response): Promise<void> => {
    try {
      // @ts-ignore
      const videoPath = req.files?.videoPath[0].path;
      const { title, description } = req.body;
      const videoId = req.params.videoId;
      const userId = req.userId;
      console.log(title, description, videoId, userId);

      if (!title || !description || !videoId || !userId || !videoPath) {
        res
          .status(400)
          .json({
            error: "title , description, videoId and userId is required",
          });
        return;
      }

      const videoQuery = `SELECT * FROM videos WHERE id=$1 AND owner_id = $2`;
      const videoValue = [videoId, userId];

      const foundVideo = await db.query(videoQuery, videoValue);

      console.log(foundVideo)
      if (foundVideo.rowCount === 0) {
        res.status(404).json({ error: "Video not found" });
        return;
      }

      const { video_url, video_public_id } = foundVideo.rows[0];

      const deleteVideoCl = await deleteFromCloudinary(
        video_url,
        video_public_id
      );

      if (!deleteVideoCl) {
        res.send("video is not delete");
        return;
      } else {
        const updateVideoDetail = await uploadOnCloudinary(videoPath);

        //   const updateText = `UPDATE videos SET title = $1, description = $2 WHERE id = $3 AND owner_id = $4 RETURNING id`;
        //  const valueText = [title, description, videoId, userId]

        if (!updateVideoDetail) {
          res.send("video is not update");
          return;
        }

        const updateQuery = `UPDATE videos SET title=$1, description=$2, video_public_id=$3, video_url=$4, updated_at=NOW()
    WHERE id=$5 AND owner_id=$6
  `;
        const updateValues = [
          title,
          description,
          updateVideoDetail?.public_id,
          updateVideoDetail?.url,
          videoId,
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
                "No matching video found or you do not have permission to update this video",
            });
          return;
        }

        res.status(200).send("video delete is successfull");
      }
    } catch (error) {
      console.log("error while updating", error);
      throw new Error("an error occured while updating");
    }
  }
);

// need to fix this
const getOnevideo = expressAsyncHandler(async (req, res) => {
  try {
    console.log("I reached here");
    const videoId = req.params.videoId;

    console.log("this is", videoId);
    if (!videoId) {
      res.status(400).json({ error: "videoId is required" });
      return;
    }

    const videoText = `SELECT video_url, title , description FROM videos WHERE id =$1`;
    const value = [videoId];

    const getVideo = await db.query(videoText, value);

    if (!getVideo) {
      res.status(404).json({ error: "no video found" });
      return;
    }

    res.status(200).json({ videoDetails: getVideo.rows });
  } catch (error) {
    console.log("error while getting video", error);
    throw new Error("an error occured while getting video");
  }
});

const getAllvideo = expressAsyncHandler(async (req, res) => {
  try {
    const videoUrl = [];
    console.log("I reached here");
    const result = await db.query(` SELECT 
    videos.id,
    videos.video_public_id, 
    videos.video_url, 
    videos.title, 
    videos.description, 
     videos.created_at,
     videos.updated_at,
    my_users.username, 
    my_users.email 
  FROM videos
  JOIN my_users ON videos.owner_id = my_users.id`);
    console.log("result", result);
    if (!result) {
      res.status(404).json({ error: "no video found" });
      return;
    }

    console.log("videos are", result.rows[0]);
    // for (let i = 0; i < result.resources.length; i++) {
    //   videoUrl.push(result.resources[i].url)
    // }
    res.json({ videoDetail: result.rows });
    return;
  } catch (error) {
    console.log("error while getting All video", error);
    throw new Error("an error occured while getting All video");
  }
});

const deleteVideo = expressAsyncHandler(async (req: variableRequest, res) => {
  try {
    const userId = req.userId;
    const videoId = req.params.videoId;
    console.log(userId, videoId);
    if (!videoId || !userId) {
      res.status(400).json({ error: "videoId and userIdis required" });
      return;
    }

    const deletTextforClodinary = `SELECT video_url, video_public_id FROM videos WHERE id = $1 AND owner_id = $2`;

    const deleteValue = [videoId, userId];

    const result = await db.query(deletTextforClodinary, deleteValue);

    if (result.rowCount === 0) {
      res
        .status(404)
        .json({
          error:
            "No video found or you do not have permission to delete this video",
        });
      return;
    }

    const videoDetails = result.rows[0];
    const publicId: string = videoDetails.video_public_id;
    const mediaUrl: string = videoDetails.video_url;

    const resultOfCloudinary = await deleteFromCloudinary(mediaUrl, publicId);

    const deleteTextForDb = `DELETE FROM videos WHERE id = $1 AND owner_id = $2 RETURNING id`;
    const deleteResult = await db.query(deleteTextForDb, deleteValue);

    if (deleteResult.rowCount === 0) {
      res.status(404).json({ error: "No video found to delete" });
      return;
    }

    res
      .status(200)
      .json({
        message: "Video deleted successfully",
        videoId: deleteResult.rows[0].id,
        cloudinaryDelete: resultOfCloudinary,
      });
    return;
  } catch (error) {
    console.log("error while deleting", error);
    throw new Error("an error occured while deleting");
  }
});

export { uploadVideoToDb, updateVideoFromDb, getOnevideo, getAllvideo, deleteVideo };
