import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

const UploadOnCloudinary = async (LoadFilePath) => {
    try {
        if(!LoadFilePath) return null;
        console.log("hi");
        //Upload File in Cloudinary
        const response = await cloudinary.uploader
        .upload(LoadFilePath, {
        resource_type: "auto", 
        })
        fs.unlinkSync(LoadFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(LoadFilePath); // Remove The Temporary Stored File After Failure
        console.log(error);
        return null;
    }
}

export {UploadOnCloudinary};
