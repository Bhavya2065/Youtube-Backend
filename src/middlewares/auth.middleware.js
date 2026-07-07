import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Extracts the authentication token from either browser cookies (for Web clients)
        // or the HTTP Authorization header (for Mobile/API clients), stripping the "Bearer " prefix.
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorize Access");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401, "Invalid access Token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
})


// =========================================================================
// IMPORTANT NOTE: About Middleware
// =========================================================================
// Whenever you add middleware You must have to take three parameters : req, res and next also
// It ensures that the logic are completed.