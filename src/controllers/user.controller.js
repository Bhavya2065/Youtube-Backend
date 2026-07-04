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
        const existedUser = User.findOne({
            $or: [{ username }, { email }]
        })

        if (existedUser) {
            throw new ApiError(409, "The Username or Email has already exist in the System !!")
        }
    }

    console.log(req.files);
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
        avatar: avatarCloudinaryPath.url,
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
        new ApiResponse(200, creaedUser, "User Registered Successfully ||")
    )

})

export { registerUser };


// =============================================== //
//                      steps
// =============================================== //
// get user details from frontend
// validation - not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return res