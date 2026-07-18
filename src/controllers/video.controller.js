import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const localVideoPath = req.files?.video[0]?.path;
    const localThumbnailpath = req.files?.thumbnail[0]?.path;
    const { title, description, isPublished } = req.body;

    if ([title, description].some((item) => item.trim().length === 0)) {
        throw new ApiError(400, "Either title or description or isPublished are empty");
    }

    if (!(localVideoPath || localThumbnailpath)) {
        throw new ApiError(400, "Video or Thumbnail both are Required");
    }

    const videoCloudinaryResponse = await uploadOnCloudinary(localVideoPath);
    const thumbnailCloudinaryResponse = await uploadOnCloudinary(localThumbnailpath);

    if (!videoCloudinaryResponse.duration) {
        throw new ApiError(400, "Video duration not found in Cloudinary Response");
    }

    const newVideo = await Video.create({
        title,
        description,
        videoFile: videoCloudinaryResponse?.url,
        thumbnail: thumbnailCloudinaryResponse?.url,
        duration: videoCloudinaryResponse?.duration,
        views: 0,
        isPublished: isPublished ? true : false,
        owner: req.user._id
    })

    if (!newVideo) {
        throw new ApiError(400, "The data is not Saved in database in video Model")
    }

    const video = await Video.findById(newVideo._id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "The Video Upload Successfully")
        )
})

const watchVideo = asyncHandler(async (req, res) => {
    const videoId = req.params.id?.trim();
    console.log(videoId);

    if (!videoId) {
        throw new ApiError(400, "video id or user not found");
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $push: {
            watchHistory: videoId
        }
    }, { new: true }).select("-password -refreshToken");
    console.log(user);

    const video = await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1
        }
    }, { new: true }).select("_id views");
    console.log(video);


    if (!user) {
        throw new ApiError(400, "User Watch History not Update");
    }

    if (!video) {
        throw new ApiError(400, "Video count is not Updated");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { user, video }, "Video is successfully added to WatchHistory")
        );
})

export {
    uploadVideo,
    watchVideo
}