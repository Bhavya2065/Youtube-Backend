import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";
import { deleteOnCloudinary } from "../utils/deleteOnCloudinary.js"

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

    if (!videoId) {
        throw new ApiError(400, "video id or user not found");
    }

    await User.findByIdAndUpdate(req.user?._id, {
        $pull: {
            watchHistory: videoId
        }
    });

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $push: {
            watchHistory: videoId
        }
    }, { new: true }).select("-password -refreshToken");

    const video = await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1
        }
    }, { new: true }).select("_id views");

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

const editVideoDetail = asyncHandler(async (req, res) => {
    const { title, isPublished, description } = req.body;
    const thumbnailLocalPath = req.file?.path;
    const videoId = req.params?.id;
    const updateFields = {}

    if (
        !thumbnailLocalPath &&
        (!title || title.trim() === "") &&
        (!description || description.trim() === "") &&
        (!isPublished || isPublished.trim() === "")
    ) {
        throw new ApiError(400, "At least one field is required to update");
    }

    if (title && title.trim() !== "") {
        updateFields.title = title;
    }

    if (description && description.trim() !== "") {
        updateFields.description = description;
    }

    if (isPublished !== undefined && isPublished.trim() !== "") {
        updateFields.isPublished = isPublished;
    }

    const { thumbnail: oldThumbnail } = await Video.findById(videoId);

    if (thumbnailLocalPath) {
        // Upload to Cloudinary first
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        updateFields.thumbnail = thumbnail.url;
        await deleteOnCloudinary(oldThumbnail, "image");
    }

    const video = await Video.findByIdAndUpdate(videoId, updateFields, {
        new: true
    })

    return res
        .status(200)
        .json(new ApiResponse(200, video, "The Video is updated Successfully"));
})

const searchVideo = asyncHandler(async (req, res) => {
    const query = req.params.query.trim().toLowerCase();
    console.log(query);

    if (!query) {
        throw new ApiError(400, "Search query is Empty");
    }

    const searchResult = await Video.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "channelName",
                pipeline: [
                    {
                        $project: {
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channelName"
        },
        {
            $match: {
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { "channelName.username": { $regex: query, $options: 'i' } }
                ]
            }
        }
    ])

    return res
        .ststus(200)
        .json(new ApiResponse(200, searchResult, "The Search is Work perfectly"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const videoId = req.params?.id.trim();

    if (!videoId) {
        throw new ApiError(400, "video does not exist");
    }

    await User.updateMany({ watchHistory: videoId }, {
        $pull: {
            watchHistory: videoId
        }
    })

    const video = await Video.findById(videoId);
    console.log(video.videoFile);
    console.log(video.thumbnail);

    await deleteOnCloudinary(video.videoFile, "video");
    await deleteOnCloudinary(video.thumbnail, "image"); 

    await Video.deleteOne({_id: videoId})

    return res
    .status(200)
    .json(new ApiResponse(200, video, "The video is successfully deleted from channel"))
})

export {
    uploadVideo,
    watchVideo,
    editVideoDetail,
    deleteVideo,
    searchVideo
}