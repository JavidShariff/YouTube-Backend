import { asyncHandler } from "../utils/asyncHandler.js";

const registorUser = asyncHandler(async (req,res) => {
    res.status(200).json({
        message : "hi from javid shariff",
    })
});

export {registorUser};