import { v2 as cloudinary } from 'cloudinary'
import { ApiError } from './ApiError.js'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const deleteOnCloudinary = async (avatarPath) => {
    try {
        if (!avatarPath) return;
        const arr = avatarPath.split("/");
        const public_id = arr[arr.length - 1].split(".")[0]
        console.log(public_id);
        const response = await cloudinary.uploader.destroy(
            public_id
        )
        console.log(`The Delete operation successfully performed ${response}`);
        return response;
    } catch (error) {
        throw new ApiError(400, "Error while deleting the assets from Cloudinary");
    }
}

export { deleteOnCloudinary };
