import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SERCET
    });

const uploadoncloud = async(localFilePath) => {
    try {
        if(!localFilePath) {
            console.log("file path not found!")
        }
        //upload the file on cloudinary
       const respone = await  cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded suceessfully and then unlink the file 
        fs.unlinkSync(localFilePath)
        fs.existsSync(localFilePath)

        return respone
        
    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);  // Remove the local saved temporary file from the server
            return null
        }
        
    }
    
}

export {uploadoncloud} 
// How It Works:
// Multer uploads the file to a temporary folder on your server.
// The file is then uploaded to Cloudinary.
// Once uploaded, the temporary file is unlink  from the server using the fs
