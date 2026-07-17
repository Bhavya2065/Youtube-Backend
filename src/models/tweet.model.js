import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({
    content: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })

export const Tweet = mongoose.Model("Tweet", tweetSchema);