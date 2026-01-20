import mongoose from "mongoose"
import { logger  } from "./logger"
import 'dotenv/config'

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://adi:GAME2003@mindease-mental-wellnes.gnezapk.mongodb.net/?appName=mindease-mental-wellness-assistant"


//Setting up database connection

export const connectDB = async () => {
    try{
        await mongoose.connect(MONGO_URI);
        logger.info("Connected to MongoDB Atlas")
    }
    catch(error){
        logger.error("MongoDB connection error:",error);
        process.exit(1)
    }
}