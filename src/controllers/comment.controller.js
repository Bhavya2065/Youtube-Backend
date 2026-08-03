import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
    const commentText = req.body?.comment;
    const userId = req.user?._id;
    const videoId = req.params?.id;

    if (!(userId || videoId)) {
        throw new ApiError(400, "UserId or videoId is not Found")
    }

    if (!commentText || commentText.length === 0) {
        throw new ApiError(400, "Comment not Found")
    }

    const comment = await Comment.create({
        content: commentText,
        video: videoId.trim(),
        owner: userId
    })

    if (!comment) {
        throw new ApiError(400, "The comment was added")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "The comment was added Successfully"))
})

const editComment = asyncHandler(async (req, res) => {
    const editedComment = req.body?.comment.trim();
    const commentId = req.params?.commentId;
    const currentUser = req.user?._id;

    if (!editedComment || editedComment.length === 0) {
        throw new ApiError(400, "The comment Not Found")
    }

    if (!commentId.trim()) {
        throw new ApiError(400, "Invalid or missing comment ID");
    }

    const commentObj = await Comment.findById(commentId.trim())

    if (!commentObj) {
        throw new ApiError(404, "Comment not found");
    }

    if (commentObj.owner.toString() !== currentUser.toString()) {
        throw new ApiError(403, "Unauthorized! You can only edit/delete your own comments")
    }

    const comment = await Comment.findByIdAndUpdate(commentId.trim(), {
        content: editedComment
    }, {new: true})

    if (!comment) {
        throw new ApiError(400, "Comment was not Edited");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment Updated Successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params?.commentId;

    if (!commentId) {
        throw new ApiError(400, "Invalid or missing comment ID");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if (!deletedComment) {
        throw new ApiError(400, "The comment was not Deleted, Something went wrong")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deleteComment, "The comment is Sucessfully Deleted"))
})

export { addComment, editComment, deleteComment }   