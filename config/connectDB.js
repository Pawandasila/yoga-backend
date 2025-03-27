import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function connectDB() {
    if (!process.env.MONGODB_URI) {
        throw new Error("Please provide mongodb url");
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("mongodb connection established");
    } catch (error) {
        console.log("mongo db error", error);
        process.exit(1);
    }
}

export default connectDB;