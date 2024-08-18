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
exports.uploadVideoOnCloudinary = uploadVideoOnCloudinary;
exports.fetchSingleVideoFromCloudinary = fetchSingleVideoFromCloudinary;
exports.fetchAllVideosFromCloudinary = fetchAllVideosFromCloudinary;
exports.deleteVideoFromCloudinary = deleteVideoFromCloudinary;
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = require("cloudinary");
// import { string } from 'zod';
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config({ path: '../backend/.env' });
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET
});
function uploadVideoOnCloudinary(videoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!videoPath) {
                console.log("no video provided");
                return null;
            }
            const result = yield cloudinary_1.v2.uploader.upload(videoPath, { resource_type: "video", folder: "mystuffs"
            });
            console.log("upload result", result);
            fs_1.default.unlinkSync(videoPath); // delete local copy after it's been uploaded to cloudinary
            return result;
        }
        catch (error) {
            console.log("error while uploading", error);
            throw new Error("Error while uploading");
        }
    });
}
function fetchSingleVideoFromCloudinary(videoId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!videoId) {
                throw new Error("videoId is not provide");
            }
            const result = yield cloudinary_1.v2.api.resource(videoId, { resource_type: "video" });
            return result;
        }
        catch (error) {
            console.log("error while fetching video", error);
            throw new Error("Error while fetching video");
        }
    });
}
function fetchAllVideosFromCloudinary() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield cloudinary_1.v2.api.resources({ resource_type: 'video' });
            return result;
        }
        catch (error) {
            console.log("error while fetching video", error);
            throw new Error("Error while fetching video");
        }
    });
}
function deleteVideoFromCloudinary(publicId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("public id", publicId);
            if (!publicId) {
                throw new Error("publicId is required");
            }
            const result = yield cloudinary_1.v2.uploader
                .destroy(publicId, { resource_type: "video" });
            if (result) {
                console.log("deleted successfully", result);
            }
            return result;
        }
        catch (error) {
            console.log("error while deleting", error);
            throw new Error("Error while uploading");
        }
    });
}
