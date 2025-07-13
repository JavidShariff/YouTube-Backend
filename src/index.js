// require("dotenv").config({path:".env"});
import { configDotenv } from "dotenv";
import express from "express";
import connectdb from "./db/db.js";

connectdb();

configDotenv({path:".env"});







// const app = express();
// ;( async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//         app.on("error",()=>{
//             console.log("error",error);
//             throw error;
//         })
//     } catch (error) {
//         console.error("ERROR IN CONNECTION MONGODB: ",error)
//     }

// })()