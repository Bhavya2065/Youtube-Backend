import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true
    },
    videos: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })

export const Playlist = mongoose.Model("Playlist", playlistSchema)