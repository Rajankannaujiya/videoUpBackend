"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("../midleware/user"));
const video_1 = require("./video");
const multer_1 = require("../midleware/multer");
const videoRouter = (0, express_1.Router)();
videoRouter.use(user_1.default);
videoRouter.route('/publish-video').post(multer_1.upload.fields([{
        name: "videoPath",
        maxCount: 1
    }]), video_1.uploadVideoToDb);
videoRouter.route("/").get(video_1.getAllvideo);
videoRouter.route("/one/:videoId").get(video_1.getOnevideo);
videoRouter.route("/delete/:videoId").delete(video_1.deleteVideo);
videoRouter.route("/update/:videoId").put(video_1.updateFromDb);
exports.default = videoRouter;
