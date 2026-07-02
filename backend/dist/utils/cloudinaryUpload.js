import cloudinary from "../config/cloudinary.js";
export const uploadToCloudinary = (buffer, folder, resourceType = "image") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (error, result) => {
            if (error || !result)
                return reject(error);
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
};
