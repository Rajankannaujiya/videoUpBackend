

import { Router } from "express";
import userMiddleware from "../midleware/user";
import { deletImage, getAllimages, getOneimage, postInfo, updateImageFromDb, uploadImageToDb } from "./image";
import { upload } from "../midleware/multer";

const imageRouter = Router();


imageRouter.use(userMiddleware)

imageRouter.route('/publishimage').post(upload.fields([{
    name: "imagePath",
    maxCount: 1
}]), uploadImageToDb);


imageRouter.route("/").get(getAllimages)

imageRouter.route("/one/:imageId").get(getOneimage);

imageRouter.route("/delete/:imageId").delete(deletImage);

imageRouter.route("/update/:imageId").put(upload.fields([{
    name: "imagePath",
    maxCount: 1
}]),updateImageFromDb);

imageRouter.route("/post").get(postInfo)

export default imageRouter;
