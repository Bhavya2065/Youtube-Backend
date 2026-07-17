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
        console.log("Decoded Token is: ", decodedToken);
        /* 
           decodedToken stores the payload of the JWT access token, which includes:
           - _id: MongoDB User ID
           - email: User's email
           - username: User's username
           - fullName: User's full name
           - iat: Issued-at timestamp (when token was created)
           - exp: Expiry timestamp (when token expires)
        */
        
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
// 1. Why verifyJWT middleware is used:
//    - It checks if a user is logged in.
//    - It verifies the access token (JWT) from cookies or request headers.
//    - It gets user details and saves them in req.user so other routes can use them.
//
// 2. How middleware works:
//    - You must use three parameters: req, res, and next.
//    - You must call next() to pass control to the next function.