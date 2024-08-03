const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });

        console.log("File has been uploaded to Cloudinary:", response.url);

        // Delete the local file after uploading
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);

        // Ensure the local file is deleted even if there's an error
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

module.exports = { uploadOnCloudinary };
