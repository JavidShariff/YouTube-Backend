import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiErrors} from "../utils/ApiErrors.js"
import {User} from "../models/user.model.js"
import {UploadOnCloudinary} from "../utils/Cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js";
import { json } from "express";
import jwt from "jsonwebtoken";
import { options } from "../constants.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId);
        
        const refreshToken = await user.generateRefreshToken();
        const accessToken = await user.generateAccessToken() ;
        console.log(accessToken);
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiErrors(500,"error in generating accesstoken and refreshtoken");
    }
}

const registerUser = asyncHandler(async (req,res) => {
    // Get UserDetails from Fontend
    // Validation 
    // Check if user already exist
    // Check Files images and avatar
    // Upload to Cloudnary 
    //create user object - create entry in database
    // check for user creation
    // return response

    const {fullname,email,username,password} = req.body;
    if(
        [fullname,email,username,password].some((ele)=>{ele?.trim() === ""}) 
    ){
        throw new ApiErrors(400,"all fields are required")
    }
    const userExist = User.findOne({
        $or : [{username},{email}]
    })
    if(!userExist){
        throw new ApiErrors(409,"User with email or username already exist");
    }
    const avatarlocalPath = req.files?.avatar[0]?.path;
    let coverImagelocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage[0].length < 0){
        coverImagelocalPath = req.files.coverImage[0].path;
    }
    if(!avatarlocalPath){
        throw new ApiErrors(400,"avatar is required");
    }
    const avatar = await UploadOnCloudinary(avatarlocalPath);
    const coverImage = await UploadOnCloudinary(coverImagelocalPath);
    if(!avatar) {
        throw new ApiErrors(400,"avatar files is required (cloudinary)");
    }
    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase() 
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    )
    console.log(createdUser);
    if(!createdUser) throw new ApiErrors(500,"Something went wrong in server");

    res.status(201).json(
        new ApiResponse(200,createdUser,"User has registered successfully")
    )
});

const loginUser = asyncHandler(async (req,res) =>{

    const {email,username,password} = req.body;
    if(!email && !username){
        throw new ApiErrors(400,"email or username required");
    }
    const user = await User.findOne({
        $or : [{email},{username}]
    })
    if(!user){
        throw new ApiErrors(400,"Invalid username or email");
    }
    console.log(user._id);
    const isPassword = await user.isPasswordCorrect(password);
    if(!isPassword){
        throw new ApiErrors(400,"Invalid user credentials");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshtoken");

    res.status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:accessToken,refreshToken,loggedInUser,
            },
            "User Logged In successfully"
        )
    )
});  

const loggedOutUser = asyncHandler(async (req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset : {
                refreshToken : 1
            }
        },
        {
            new : true
        }
    )


    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User Logged Out")
    )
});

const refreshAccessToken = asyncHandler(async (req,res) =>{
try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if(!refreshToken){
            throw new ApiErrors(401,"unauthorized access");
        }
        const decodedRefreshToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedRefreshToken._id);
        if(user?.refreshToken !== refreshToken){
            throw new ApiErrors(401,"unauthorized access");
        }
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(decodedRefreshToken._id);
    
        return res.status(200).cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,
                {
                accessToken,refreshToken : newRefreshToken
                },
                "Access Token Refreshed"
            )
        )
} catch (error) {
    throw new ApiErrors(400, error?.message|| "Invalid RefreshToken")
}

})

const changeCurrentPassword = asyncHandler(async (req,res) =>{
    const {newPassword,oldPassword} = req.body;
    const user = await User.findById(req.user?._id);
    const correctPassword = user.isPasswordCorrect();
    if(!correctPassword){
        throw new ApiErrors(400,"Wrong Password");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(
        new ApiResponse(200,{},"Password Has Been Changed Successfully")
    );
})

const getUser = asyncHandler(async (req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,{data:req.user},"Fetched Data Successfully")
    )
})

const updateUserData = asyncHandler(async (req,res)=>{
    const {fullName, email} = req.body;
    if(!(fullName || email)){
        throw new ApiErrors(400,"All Fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName,
                email
            }
        },
        {new : true}
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200,{
            data : user
        },
        "Updated User Successfully"
    )
)
})

const uploadAvatar  = asyncHandler(async (req,res)=>{
    const avatarFileLocalPath = req.file?.avatar;
    if(!avatarFileLocalPath){
        throw new ApiErrors(400,"Avatar File is Missing");
    }

    const avatar = await UploadOnCloudinary(avatarFileLocalPath);
    if(!avatar){
        throw new ApiErrors(400,"Avatar Update is Unsuccessfull");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200,{
            data:user
        },
        "Update Avatar Successfully"
    )
    )
})

const uploadCoverImage  = asyncHandler(async (req,res)=>{
    const coverImageFileLocalPath = req.file?.avatar;
    if(!coverImageFileLocalPath){
        throw new ApiErrors(400,"Avatar File is Missing");
    }

    const coverImage = await UploadOnCloudinary(coverImageFileLocalPath);
    if(!coverImage){
        throw new ApiErrors(400,"Avatar Update is Unsuccessfull");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200,{
            data:user
        },
        "Update coverImage Successfully"
    )
    )
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req.params;
    if(!username){
        throw new ApiErrors(400,"Username is required");
    }

    const channel = await User.aggregate([
        {
            $match : {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size : "$subscriber"
                },
                channelsSubscribedToCount:{
                    $size : "$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                email:1,
                subscriberCount:1,
                channelsSubscribedToCount:1,
                avatar:1,
                coverImage:1,
                username:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiErrors(400,"Channel doesnot exist")
    }

    return res.status(200).json(
        new ApiResponse(200,channel[0],"User Channel Fetched Successfully")
    )
})

const getUserWatchHistory = asyncHandler(
    (async (req,res)=>{

    const channel = await User.aggregate([
        {
            $match:{
                _id : mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $addFields:{
                            owner:{
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    if(!channel?.length){
        throw new ApiErrors(400,"Channel doesnot exist")
    }

    return res.status(200).json(
        new ApiResponse(200,channel[0].watchHistory,"Fetch WatchHistory Successfully")
    )
})
) 

export {
    registerUser,
    loginUser,
    loggedOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getUser,
    updateUserData,
    uploadCoverImage,
    uploadAvatar,
    getUserWatchHistory,
    getUserChannelProfile
};