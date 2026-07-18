import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String, // cloudinary url
        required: true
    },
    thumbnail: {
        type: String, // cloudinary url
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number, // cloudinary send the information about duration
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema);

// =========================================================================
// MONGOOSE VIDEO MODEL EXPLANATION
// =========================================================================
// 1. owner (Schema.Types.ObjectId):
//    - Links each video to a specific User in the database using their ID.
// 2. timestamps: true
//    - Automatically adds 'createdAt' and 'updatedAt' date fields to each video.
// 3. mongooseAggregatePaginate:
//    - A plugin that helps us paginate (divide into pages) complex video listings 
//      and search results when using aggregation pipelines.
