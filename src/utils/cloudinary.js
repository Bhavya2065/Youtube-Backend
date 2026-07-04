import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const handleOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        }) // after that file was upload successfully on cloudinary
        console.log("Cloudinary Upload Success -> File URL: ", response.url);
        fs.unlinkSync(localFilePath) // we use unlinkSync because it is synchronous task means during this task the execution will be stopped after completion the other code is running.
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // Remove the local saved temporary file
    }
}

export {handleOnCloudinary};