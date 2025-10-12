import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, _,next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiErrors(400,"Invalid Token");
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET).select("-password -refreshToken");
        const user = User.findById(decodedToken?._id);
        if(!user){
            throw new ApiErrors(400,"Invalid Access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiErrors(400,error);
    }
})

export default verifyJWT;