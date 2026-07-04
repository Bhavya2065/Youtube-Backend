import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.model.js';
import { handleOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body  

    if ([fullName, email, username, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are Require")
    } else {
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (existedUser) {
            throw new ApiError(409, "The Username or Email has already exist in the System !!")
        }
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is must required")
    }

    const avatarCloudinaryPath = await handleOnCloudinary(avatarLocalPath)
    const coverImageCloudinaryPath = await handleOnCloudinary(coverImageLocalPath)

    if (!avatarCloudinaryPath) {
        throw new ApiError(400, "Avatar File is required")
    }

    const newUser = await User.create({
        fullName,
        avatar: avatarCloudinaryPath?.url,
        coverImage: coverImageCloudinaryPath?.url || "",
        email,
        username: username.toLowerCase(),
        password
    })

    const creaedUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    )

    if(!creaedUser){
        throw new ApiError(400, "Something went wrong while creating new user")
    }

    return res.status(201).json(
        new ApiResponse(201, creaedUser, "User Registered Successfully ||")
    )

})

export { registerUser };

// =========================================================================
// REGISTER USER FLOW STEPS:
// =========================================================================
// 1. Get user details from frontend (req.body)
// 2. Validate input fields (ensure no field is empty/missing)
// 3. Check if username or email already exists in the database
// 4. Retrieve local paths of uploaded files (avatar & cover image) from multer
// 5. Ensure avatar file is provided
// 6. Upload avatar and cover image files to Cloudinary
// 7. Check if avatar was successfully uploaded to Cloudinary
// 8. Create and save new user in database (hash password automatically via pre-hook)
// 9. Fetch saved user object excluding password and refreshToken
// 10. Check if user was successfully created
// 11. Send success response back to frontend