import mongoose from "mongoose";
import { DB_NAME } from "../src/constants.js";  // Make sure this is the correct path

const connectDB = async () => {
    try {
        // Ensure MONGODB_URL is set in the .env file
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`MongoDB connected successfully! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);  // Exit the process if the connection fails
    }
};

export default connectDB;
