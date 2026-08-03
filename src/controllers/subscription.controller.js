import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const channelId = req.params?.channelId?.trim();
    const userId = req.user?._id;
    let subscriptionStatus;

    const subscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    if (subscription) {
        subscriptionStatus = await Subscription.findOneAndDelete({ subscriber: userId, channel: channelId })

        if (!subscriptionStatus) {
            throw new ApiError(400, "Problem with Delete Subscription");
        }
    } else {
        subscriptionStatus = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })

        if (!subscriptionStatus) {
            throw new ApiError(400, "Something went wrong, No ducument created");
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            subscriptionStatus,
            subscription ? "Unsubscribe Successfully" : "Subscribed Successfully"
        ))
})

export { toggleSubscription }