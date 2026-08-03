import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // the subscriber is also a user
        ref: "User",
        require: true
    },
    channel: {
        type: Schema.Types.ObjectId, // the channel owner is also a user
        ref: "User",
        require: true
    }

}, { timestamps: true })

subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);