import { Router } from "express";
import userMiddleware from "../midleware/user";
import { postInfo, userPost } from "./post";

const postRouter = Router();

postRouter.use(userMiddleware)

postRouter.get("/",postInfo);

postRouter.get("/userPost",userPost);


export {postRouter}