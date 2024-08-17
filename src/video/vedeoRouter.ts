
import { Router } from "express";
import userMiddleware from "../midleware/user";
import { deleteVideo, getAllvideo, getOnevideo, updateFromDb, uploadVideoToDb } from "./video";
import { upload } from "../midleware/multer";

const videoRouter = Router();


videoRouter.use(userMiddleware)

videoRouter.route('/publish-video').post(upload.fields([{
    name: "videoPath",
    maxCount: 1
}]), uploadVideoToDb);


videoRouter.route("/").get(getAllvideo)

videoRouter.route("/one/:videoId").get(getOnevideo);

videoRouter.route("/delete/:videoId").delete(deleteVideo);

videoRouter.route("/update/:videoId").put(updateFromDb);

export default videoRouter;
