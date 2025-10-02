import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    fullname: {
      required: true,
      type: string,
      trim: true,
      index: true,
    },
    avator: {
      required: true,
      type: string,
    },
    coverImage: {
      type: string,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: string,
      required: [true, "password is required"],
    },
    refreshTokens: {
      type: string,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function async (next) {
  if(!this.isModified("password")) next();
  this.password = bcrypt.hash(this.password,10);
  next();
})
userSchema.methods.ispasswordcorrect = async function (password){
  return await bcrypt.compare(password,this.password);
}
userSchema.methods.generateAccessToken = async function (){
  jwt.sign(
  {
    _id : this._id,
    fullname: this.fullname,
    username:this.username,
    email:this.email
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn : process.env.ACCESS_TOKEN_EXPIRY
  }
)}


userSchema.methods.generateRefreshToken = async function (){
  jwt.sign(
  {
    _id : this._id
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn : process.env.REFRESH_TOKEN_EXPIRY
  }
)
}

export const User = mongoose.model("User",userSchema);