import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const createSubscriberRecord = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user?._id;

    const subscription = await Subscription.create({
        subscriber: userId,
        channel: channelId
    })

    if (!subscription) {
        throw new ApiError(400, "Something went wrong, No ducument created");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscription, "New Subscription document is created"))
})

const deleteSubscriberRecord = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user?._id;

    const deletedSubscription = await Subscription.findOneAndDelete({subscriber: userId, channel: channelId})

    if(!deletedSubscription){
        throw new ApiError(400, "Problem with Delete Subscription");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedSubscription, "These Subscription deleted Successfully"));
})

export { createSubscriberRecord, deleteSubscriberRecord }