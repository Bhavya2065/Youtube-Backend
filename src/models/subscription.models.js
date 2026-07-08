import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // the subscriber is also a user
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // the channel owner is also a user
        ref: "User"
    }

}, { timestamps: true })

export const Subscription = mongoose.Model("Subscription", subscriptionSchema);