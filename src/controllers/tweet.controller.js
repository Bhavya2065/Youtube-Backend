import { Tweet } from '../models/tweet.model.js'
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const addPost = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const postContent = req.body?.content;

    if (!postContent || postContent.trim().length === 0) {
        throw new ApiError(400, "Tweet Content don't get from client")
    }

    const tweet = await Tweet.create({
        content: postContent,
        owner: userId
    })

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating the tweet")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "New tweet is created successfully"))
})

const viewPost = asyncHandler(async (req, res) => {
    const postId = req.params?.postId.trim();

    if (!postId) {
        throw new ApiError(400, "Invalid or missing Post ID")
    }

    const post = await Tweet.findById(postId.trim());

    if (!post) {
        throw new ApiError(404, "Tweet/Post not Found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Tweet fetched Successfully"))
})

const getAllPost = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const tweets = await Tweet.find({ owner: userId })

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "All tweets fetched Successfully"))
})

const editPost = asyncHandler(async (req, res) => {
    const postId = req.params?.postId.trim();

    if (!postId) {
        throw new ApiError(400, "Invalid or missing Post ID")
    }

    const content = req.body?.content;

    if (!content) {
        throw new ApiError(400, "Tweet content is missing or Invalid")
    }

    const userId = req.user?._id;
    const post = await Tweet.findById(postId);

    if (!post) {
        throw new ApiError(404, "Tweet not found");
    }

    if (!(post.owner.toString() === userId)) {
        throw new ApiError(401, "Unauthorize access")
    }

    const updatedPostContent = await Tweet.findByIdAndUpdate(postId, { content }, { new: true });

    if (!updatedPostContent) {
        throw new ApiError(500, "The content is not updated on tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPostContent, "Tweet content updated successfullly"))
})

const deletePost = asyncHandler(async (req, res) => {
    const postId = req.params?.postId;

    if (!postId) {
        throw new ApiError(400, "Invalid or missing Post ID")
    }

    const userId = req.user?._id;
    const post = await Tweet.findById(postId);

    if (!post) {
        throw new ApiError(404, "Tweet not found");
    }

    if (!(post.owner.toString() === userId)) {
        throw new ApiError(401, "Unauthorize access")
    }

    const deletedPost = await Tweet.findByIdAndDelete(postId);

    if (!deletedPost) {
        throw new ApiError(500, "Something went wrong when Delete the tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedPost, "Tweet deleted successfully"))
})

export { addPost, viewPost, getAllPost, editPost, deletePost }

