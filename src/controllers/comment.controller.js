import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import ApiResponse from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoid} = req.params
    const {page = 1, limit = 10} = req.query;
    const options = {
        page : parseInt(page,10),
        limit: parseInt(limit,10)
    }
    const pipeline = [
        {
            $match : {video : new mongoose.Types.ObjectId(videoid)}
        },
        {
            $lookup : {
                from : "users",
                localField: "owner",
                foreignField : "_id",
                as:"owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project : {
                content:1,
                createdAt:1,
                "owner.username":1,
                "owner.avatar":1
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]
    const comments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options);

    if (!comments || comments.docs.length === 0) {
        throw new ApiErrors(404, "No comments found for this video");
    }

    res.status(200).json(
        new ApiResponse(200,comments,"Comment has been successfully fetched")
    );
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoid} = req.params;
    const {content} = req.body;
    if(!content){
        throw new ApiErrors(400,"Content is Required");
    }
    const comment = await Comment.create({
        content,
        video:videoid,
        owner:req.user._id
    })

    if(!comment){
        throw new ApiErrors(400,"comment is not added try again later");
    }

    res.status(200).json(
        new ApiResponse(200,comment,"comments has been added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentid} = req.params;
    const {content} = req.body;
    if(!content){
        throw new ApiErrors(400,"Content is Required");
    }
    const comment = await Comment.findByIdAndUpdate(
        commentid,
        {
            $set : {
                content
            }
        },
        {
            new:true
        }
    );
    if(!comment){
        throw new ApiErrors(400,"comment is not updated try again later");
    }

    res.status(200).json(
        new ApiResponse(200,comment,"comment has been updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentid} = req.params;
    const comment = await Comment.findByIdAndDelete(commentid);
    if(!comment){
        throw new ApiErrors(400,"comment has not been deleted try again later");
    }
    res.status(200).json(
        new ApiResponse(200,comment,"comment has been deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }