import dotenv from 'dotenv';
import {v2} from 'cloudinary'
// import { string } from 'zod';
import fs from 'fs';
dotenv.config()


v2.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUDINARY_APIKEY,
    api_secret:process.env.CLOUDINARY_APISECRET
});



export async function uploadVideoOnCloudinary (videoPath:string){
try {
        if(!videoPath){
            console.log("no video provided");
            return null
        }
        const result =await v2.uploader.upload(videoPath, {resource_type: "video", folder: "mystuffs"
           
      });
    
      console.log("upload result",result)
        fs.unlinkSync(videoPath);  // delete local copy after it's been uploaded to cloudinary
        return result;
} catch (error) {
    console.log("error while uploading",error);
    throw new Error("Error while uploading")
}
}



export async function fetchSingleVideoFromCloudinary(videoId:string) {
   try {
     if(!videoId){
         throw new Error("videoId is not provide");
     }
     const result = await v2.api.resource(videoId, {resource_type: "video"})
     return result;
   } catch (error) {
    console.log("error while fetching video",error);
    throw new Error("Error while fetching video")
   }
}


export async function fetchAllVideosFromCloudinary() {
    try {
      const result = await v2.api.resources(
        { resource_type: 'video' });
        return result;
    } catch (error) {
     console.log("error while fetching video",error);
     throw new Error("Error while fetching video")
    }
 }


export async function deleteVideoFromCloudinary(publicId:string) {
try {
    console.log("public id", publicId)
    if ( !publicId) {
        throw new Error ("publicId is required")
    }
     const result = await v2.uploader
      .destroy(publicId,{ resource_type: "video" });
      
    
      if(result){
        console.log("deleted successfully", result);
      }
      return result;
} catch (error) {
    console.log("error while deleting",error)
    throw new Error("Error while uploading")
}
}


