import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    content: {
        type: String,
        trim: true
    },
    video: {
        type: mongoose.Types.ObjectId,
        ref: "Video"
    },
    owner:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

export const Comment = mongoose.Model("Comment", commentSchema);