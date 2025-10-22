import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import ApiResponse from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoid} = req.params
    const userId = req.user._id;
    //TODO: toggle like on video
    console.log(videoid);
    console.log(userId);
    if (!mongoose.isValidObjectId(videoid)) {
    throw new ApiErrors(400, "Invalid video id")
    }
    // const likeExist = await Like.findOne({video:videoid,likedBy:userId});
    const likeExist = await Like.findOne({ video: videoid, likedBy: userId });
    if(likeExist){

        const response  = await likeExist.deleteOne();
        if(!response){
            throw new ApiErrors(404,"Server Problem Try Again Later");
        }
        return res.status(200).json(
            new ApiResponse(200,response,"like on Video has been removed Successfully")
        )
    }
    else
    {
        const newLike = await Like.create({
            video:videoid,
            likedBy:userId
        })
        if(!newLike){
            throw new ApiErrors(404,"Server Problem Try Again Later");
        }
        return res.status(200).json(
            new ApiResponse(200,newLike,"Like on Video has been successfully added")
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentid} = req.params
    //TODO: toggle like on comment
    
    const userId = req.user._id;
    //TODO: toggle like on video
    const commentExist = await Like.findOne({comment:commentid,likedBy:userId});
    if(!commentExist){
        const newComment = await Like.create({
            comment:commentid,
            likedBy:userId
        })
        if(!newComment){
            throw new ApiErrors(404,"Server Problem Try Again Later");
        }
        return res.status(200).json(
            new ApiResponse(200,newComment,"Like on Comment has been successfully added")
        )
    }
    else
    {
        const response  = await commentExist.deleteOne();
        if(!response){
            throw new ApiErrors(404,"Server Problem Try Again Later");
        }
        return res.status(200).json(
            new ApiResponse(200,response,"like on Comment has been removed Successfully")
        )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetid} = req.params
    //TODO: toggle like on tweet
        const userId = req.user._id;
    //TODO: toggle like on video
    const tweetExist = await Like.findOne({tweet:tweetid,likedBy:userId});
    if(!tweetExist){
        const newTweet = await Like.create({
            tweet:commentid,
            likedBy:userId
        })
        if(!newTweet){
            throw new ApiErrors(404,"Server Problem Try Again Later");
        }
        return res.status(200).json(
            new ApiResponse(200,newTweet,"Like on Comment has been successfully added")
        )
    }
    else
    {
        const response  = await tweetExist.deleteOne();
        if(!response){
            throw new ApiErrors(404,"Server Problem Try Again Later");
        }
        return res.status(200).json(
            new ApiResponse(200,response,"like on Comment has been removed Successfully")
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id;
    const options = {
        page : parseInt(1,10),
        limit: parseInt(10,10)
    }
    const pipeline = [
        {
            $match : {
               likedBy :  new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as: "video" 
            }
        },
        {
            $unwind: "$video",
        },
        {
            $project:{
                "video.title":1,
                "video.description":1,
                "video.thumbnail":1,
            }
        }
    ]

    const likedVideos = await Like.aggregatePaginate(Like.aggregate(pipeline), options);

    if(!likedVideos){
        throw new ApiErrors(400,"No videos Exist");
    }

    res.status(200).json(
        new ApiResponse(200,likedVideos,"Fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}