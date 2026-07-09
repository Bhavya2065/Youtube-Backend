import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body

    if ([fullName, email, username, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are Require")
    } else {
        // Returns user object if found, or null if not found
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (existedUser) {
            throw new ApiError(409, "The Username or Email has already exist in the System !!")
        }
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path; // one more optional chaining bcz if the coverImage array not found then it will set undefine so the logic made is undefined[0] which crash the application immediately.

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is must required")
    }

    const avatarCloudinaryPath = await uploadOnCloudinary(avatarLocalPath)
    const coverImageCloudinaryPath = await uploadOnCloudinary(coverImageLocalPath)

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

    if (!creaedUser) {
        throw new ApiError(400, "Something went wrong while creating new user")
    }

    return res.status(201).json(
        new ApiResponse(201, creaedUser, "User Registered Successfully ||")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or Email are required")
    }

    // Here is an alternative of above code based on logic
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
    // }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "The User is not Exist in Record")
    }

    if (!password) {
        throw new ApiError(400, "Password is required")
    } else {
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(400, "Incorrect Password");
        }
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const currentUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // A simple example of the options object used to secure a cookie
    const cookieOptions = {
        httpOnly: true,      // Prevents JavaScript access (blocks XSS)
        secure: true,        // Requires HTTPS connection
        // sameSite: 'strict',  // Blocks cross-site requests (prevents CSRF)
        // signed: true,        // Cryptographically signs the cookie
        // maxAge: 3600000      // Expires in 1 hour
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { user: currentUser, accessToken, refreshToken }, "User LoggedIn successfully!!")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    // 1. We set refreshToken to undefined to clear its value.
    // 2. { new: true } tells Mongoose to return the updated user document instead of the old one. In old one the refreshToken is exist, So it may be create the issue
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    )

    const cookieOptions = {
        httpOnly: true,      // Prevents JavaScript access (blocks XSS)
        secure: true,        // Requires HTTPS connection
    };

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200, {}, "User Logged Out Successfully")
        )
})

const refreshAcessToken = asyncHandler(async (req, res) => {
    // step 1
    const incomingRefreshToken = req.cookies?.refreshToken || req.header?.("Authorization")?.replace("Bearer ", "");
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorize request")
    }

    try {
        // step 2
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        console.log(decodedToken);
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid RefreshToken");
        }

        // step 3
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token was Expired");
        }

        // step 4
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
        const cookieOptions = {
            httpOnly: true,
            secure: true
        }

        // step 5
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(200, { user: user, accessToken, refreshToken }, "Access Token Refreshed")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Something went wrong in refreshing the token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // step 1
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req?.user._id);
    if (!user) {
        throw new ApiError(401, "Unauthorize Access");
    }

    // step 2
    if (!await user.isPasswordCorrect(oldPassword)) {
        throw new ApiError(401, "Old Password does not match")
    }

    // step 3
    user.password = newPassword; // set new password
    await user.save({ validateBeforeSave: false })

    // step 4
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    // step 1
    const { fullName, email } = req.body
    if (!(fullName || email)) {
        throw new ApiError(400, "Fullname or Email are not exist")
    }

    // step 2
    const user = await User.findByIdAndUpdate(
        req?.user._id,
        {
            $set: { fullName, email } // we use js shorthand property like {fullname: fullName}
        },
        { new: true }
    ).select("-password")

    // step 3
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Not Found")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar?.url) {
        throw new ApiError(400, "Error while uploading on Avatar")
    }

    const user = await User.findByIdAndUpdate(
        req?.user._id,
        {
            $set: { avatar: avatar.url }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(
            200, user, "Avatar Updated successfully"
        ))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage Not Found")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage?.url) {
        throw new ApiError(400, "Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req?.user._id,
        {
            $set: { coverImage: coverImage.url || "" }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(
            200, user, "coverImage Updated successfully"
        ))
})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // Save it in  DB here!
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while generating refresh and access token")
    }
}


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAcessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};

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


// =========================================================================
// LOGIN USER FLOW STEPS:
// =========================================================================
// 1. Get username and password click login
// 2. Validate input fields (ensure no field is empty/missing)
// 3. validate username and password and find that user that have already exist
// 4. genearte the access token and refresh token
// 5. store refresh token in db and access token in http-only coockies

// =========================================================================
// IMPORTANT NOTE: COOKIE SECURITY & CONTROL
// =========================================================================
// Cookies are fully editable by the end user. Because cookies are stored
// on the client side (in the user's browser), the user has complete control
// over them. Anyone can view, modify, or delete their cookies at any time.

// =========================================================================
// IMPORTANT NOTE: THROWING ERRORS VS RETURNING SUCCESS RESPONSES
// =========================================================================
// 1. We use "throw" for errors (like ApiError) to instantly stop the code
//    execution and send the error to Express's error handler.
// 2. We do NOT use "throw" for success (like ApiResponse). Instead, we
//    simply "return" the response because everything worked correctly.