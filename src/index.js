// require("dotenv").config({path:".env"});
import { configDotenv } from "dotenv";
import express from "express";
import connectdb from "./db/db.js";
configDotenv({path:".env"});
import { app } from "./app.js";

connectdb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is listening at PORT ${process.env.PORT}`);
    })
}).catch((error)=>{
    console.error("ERROR IN MONGODB", error);
});






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