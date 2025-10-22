import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import ApiResponse from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {UploadOnCloudinary} from "../utils/Cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

  const pipeline = [];

  // 🔍 Filter by search query if provided
  if (query) {
    pipeline.push({
      $match: {
        title: { $regex: query, $options: "i" }
      }
    });
  }

  // 👤 Filter by user (optional)
  if (userId) {
    pipeline.push({
      $match: { owner: new mongoose.Types.ObjectId(userId) }
    });
  }

  // 🔽 Sorting
  const sortDirection = sortType === "desc" ? -1 : 1;
  pipeline.push({
    $sort: { [sortBy]: sortDirection }
  });

  // 📄 Pagination using aggregatePaginate
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };

  const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

  if (!videos) {
    throw new ApiErrors(400, "Error fetching videos");
  }

  res.status(200).json(
    new ApiResponse(200, videos, "Videos fetched successfully")
  );
});


const publishAVideo = asyncHandler(async (req, res) => {
try {
        const { title, description } = req.body
        // TODO: get video, upload to cloudinary, create video
        const videoLocalPath = req.files?.videoFile[0].path;
        const thumbNailLocalPath = req.files?.thumbnail[0].path;
        const videoFile = await UploadOnCloudinary(videoLocalPath);
        const thumbnail = await UploadOnCloudinary(thumbNailLocalPath);

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

        const { videoid } = req.params
        //TODO: get video by id
        const userVideo = await Video.findById(videoid);
        if(!userVideo){
            throw new ApiErrors(400,"Video does not exist");
        }
        res.status(200).json(
            new ApiResponse(200,userVideo,"Fetch Video Successfully")
        )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoid } = req.params;
    //TODO: update video details like title, description, thumbnail
    const {title,description,thumbnail} = req.body;

    if(!title && !description){
        throw new ApiErrors(400,"Title and Description are required");
    }

    console.log("This is Video Id: ",videoid);
    const thumbNailLocalPath = req.file.path;

    if(!thumbNailLocalPath){
        throw new ApiErrors(400,"Thumbnail is Required");
    }
    const thumbNail = await UploadOnCloudinary(thumbNailLocalPath);

    if(!thumbNail){
        throw new ApiErrors(400,"Error in Uploading thumbnail");
    }
    
    const userVideo = await Video.findByIdAndUpdate(
        videoid,
        {
            $set : {
                title,
                description,
                thumbnail : thumbNail.url
            }
        },
        {
            new:true
        }
    );

    if(!userVideo){
        throw new ApiErrors(400,"Unauthorized Access");
    }
    res.status(200).json(
        new ApiResponse(200,userVideo,"video has been updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoid } = req.params
    //TODO: delete video
    const userVideo = await Video.findByIdAndDelete(videoid);

    if(!userVideo){
        throw new ApiErrors(400,"error in deleting the video");
    }

    res.status(200).json(
        new ApiResponse(200,userVideo,"Video has been Deleted Successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoid } = req.params;
    const userVideo = await Video.findById(videoid);
    if(!userVideo){
        throw new ApiErrors(400,"video does not founded");
    }
    console.log(userVideo);
    userVideo.ispublished = !(userVideo.ispublished);
    const isPublished = await userVideo.save();
    if(!isPublished){
        throw new ApiErrors(400,"does not updated");
    }
    res.status(200).json(
        new ApiResponse(200,isPublished,"toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}