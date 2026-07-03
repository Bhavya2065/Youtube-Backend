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
        console.log("file was upload successfully on cloudinary", response, response.url);
        return response
    } catch (error) {
        fs.unlink(localFilePath) // Remove the local saved temporary file
    }
}

export {handleOnCloudinary};