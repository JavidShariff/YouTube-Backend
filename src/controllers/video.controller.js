import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import ApiResponse from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {UploadOnCloudinary} from "../utils/Cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
try {
        const { title, description } = req.body
        // TODO: get video, upload to cloudinary, create video
        const videoLocalPath = req.files?.videoFile[0].path;
        const thumbNailLocalPath = req.files?.thumbnail[0].path;
        const videoFile = await UploadOnCloudinary(videoLocalPath);
        const thumbnail = await UploadOnCloudinary(thumbNailLocalPath);
        console.log(videoFile?.url);
        console.log(thumbnail?.url);
        console.log(videoFile?.duration);
        const userVideo = await Video.create({
            videofile: videoFile.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration:videoFile.duration,
            owner:req.user._id
        })
        if(!userVideo){
            throw new ApiErrors(400,"Video Uploading error");
        }
        console.log("Successfully Created",userVideo);

        res.status(200).json(
            new ApiResponse(200,{data : userVideo},"Video has been Uploaded Successfully")
        )

} catch (error) {
    throw new ApiErrors(400,error);
}
})

const getVideoById = asyncHandler(async (req, res) => {
try {
        const { videoid } = req.params
        //TODO: get video by id
        const userVideo = await Video.findById(videoid);
        if(!userVideo){
            throw new ApiErrors(400,"Video does not exist");
        }
        res.status(200).json(
            new ApiResponse(200,userVideo,"Fetch Video Successfully")
        )
} catch (error) {
    console.log(error);
}
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}