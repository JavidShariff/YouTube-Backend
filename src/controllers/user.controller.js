import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiErrors} from "../utils/ApiErrors.js"
import {User} from "../models/user.model.js"
import {UploadOnCloudinary} from "../utils/Cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js";
import { json } from "express";

const generateAccessAndRefreshToken = async (userId) =>{
    try {
        const user = User.findById(userId);
        const refreshToken = user.generateAccessToken();
        const accessToken = user.generateRefreshToken();
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
    if(!(email || username)){
        throw new ApiErrors(400,"email and username required");
    }
    const user = User.findOne({
        $or : [{email},{username}]
    })
    if(!user){
        throw new ApiErrors(400,"Invalid username or email");
    }
    const isPassword = await user.isPasswordCorrect(password);
    if(!isPassword){
        throw new ApiErrors(400,"Invalid user credentials");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = User.findById(user._id).select("-password -refreshtoken");
    const options = {
        httpOnly : true,
        secure : true
    }
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
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
        new ApiResponse(200,{},"User Logged Out")
    )
});


export {
    registerUser,
    loginUser,
    loggedOutUser
};