"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVideo = exports.getAllvideo = exports.getOnevideo = exports.updateFromDb = exports.uploadVideoToDb = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const video_1 = require("../cloudynary/video");
const db_1 = __importDefault(require("../db/db"));
const uploadVideoToDb = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // @ts-ignore
        const videoPath = (_a = req.files) === null || _a === void 0 ? void 0 : _a.videoPath[0].path;
        console.log("videopath", videoPath);
        console.log("this is the video", videoPath);
        const { title, description } = req.body;
        console.log(req.body);
        console.log(req.userId);
        if (!videoPath || !title || !description) {
            throw new Error("Video, title, and description are required");
        }
        const video = yield (0, video_1.uploadVideoOnCloudinary)(videoPath);
        console.log("This is video:", video);
        if (!video) {
            throw new Error("An error occurred while uploading the video");
        }
        const insertText = `INSERT INTO videos (video_public_id, video_url, title, description, duration, owner_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
        const valueText = [video === null || video === void 0 ? void 0 : video.public_id, video === null || video === void 0 ? void 0 : video.url, title, description, video === null || video === void 0 ? void 0 : video.duration, req.userId];
        const createdVideo = yield db_1.default.query(insertText, valueText);
        if (!createdVideo) {
            throw new Error("Error while inserting to database");
        }
        res.status(200).json({ video_url: video.url, video_publicId: video.public_id });
        return;
    }
    catch (error) {
        console.log("Error occurred while uploading:", error);
        throw new Error("error occur while uploading to db"); // Pass the error to the next middleware or error handler
    }
}));
exports.uploadVideoToDb = uploadVideoToDb;
const updateFromDb = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description } = req.body;
        const videoId = req.params.videoId;
        const userId = req.userId;
        console.log(title, description, videoId, userId);
        if (!title || !description || !videoId || !userId) {
            res.status(400).json({ error: "title , description, videoId and userId is required" });
            return;
        }
        const updateText = `UPDATE videos SET title = $1, description = $2 WHERE id = $3 AND owner_id = $4 RETURNING id`;
        const valueText = [title, description, videoId, userId];
        const result = yield db_1.default.query(updateText, valueText);
        console.log("updated result", result.rows);
        if (result.rowCount === 0) {
            res.status(404).json({ error: "No matching video found or you do not have permission to update this video" });
            return;
        }
        res.status(200).json({ updatedVideoId: result.rows[0].id });
    }
    catch (error) {
        console.log("error while updating", error);
        throw new Error("an error occured while updating");
    }
}));
exports.updateFromDb = updateFromDb;
// need to fix this 
const getOnevideo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const getVideo = yield db_1.default.query(videoText, value);
        if (!getVideo) {
            res.status(404).json({ error: "no video found" });
            return;
        }
        res.status(200).json({ videoDetails: getVideo.rows });
    }
    catch (error) {
        console.log("error while getting video", error);
        throw new Error("an error occured while getting video");
    }
}));
exports.getOnevideo = getOnevideo;
const getAllvideo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const videoUrl = [];
        console.log("I reached here");
        const result = yield (0, video_1.fetchAllVideosFromCloudinary)();
        console.log("result", result);
        if (!result) {
            res.status(404).json({ error: "no video found" });
            return;
        }
        for (let i = 0; i < result.resources.length; i++) {
            videoUrl.push(result.resources[i].url);
        }
        res.status(200).json({ videos: videoUrl });
        return;
    }
    catch (error) {
        console.log("error while getting All video", error);
        throw new Error("an error occured while getting All video");
    }
}));
exports.getAllvideo = getAllvideo;
const deleteVideo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const videoId = req.params.videoId;
        console.log(userId, videoId);
        if (!videoId || !userId) {
            res.status(400).json({ error: "videoId and userIdis required" });
            return;
        }
        const deletTextforClodinary = `SELECT video_public_id FROM videos WHERE id = $1 AND owner_id = $2`;
        const deleteValue = [videoId, userId];
        const result = yield db_1.default.query(deletTextforClodinary, deleteValue);
        if (result.rowCount === 0) {
            res.status(404).json({ error: "No video found or you do not have permission to delete this video" });
            return;
        }
        const videoDetails = result.rows[0];
        const publicId = videoDetails.video_public_id;
        const resultOfCloudinary = yield (0, video_1.deleteVideoFromCloudinary)(publicId);
        const deleteTextForDb = `DELETE FROM videos WHERE id = $1 AND owner_id = $2 RETURNING id`;
        const deleteResult = yield db_1.default.query(deleteTextForDb, deleteValue);
        if (deleteResult.rowCount === 0) {
            res.status(404).json({ error: "No video found to delete" });
            return;
        }
        res.status(200).json({ message: "Video deleted successfully", videoId: deleteResult.rows[0].id, cloudinaryDelete: resultOfCloudinary });
        return;
    }
    catch (error) {
        console.log("error while deleting", error);
        throw new Error("an error occured while deleting");
    }
}));
exports.deleteVideo = deleteVideo;
