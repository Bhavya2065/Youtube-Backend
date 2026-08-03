import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    content: {
        type: String,
        trim: true,
        require: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        require: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true
    }
}, { timestamps: true })

export const Comment = mongoose.model("Comment", commentSchema);