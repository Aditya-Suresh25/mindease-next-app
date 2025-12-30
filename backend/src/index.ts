import express, {Request,Response} from "express"
import { serve } from "inngest/express";
import { inngest,functions } from "./inngest";
import {functions as inggestFunctions} from "./inngest/functions"
import {logger} from "./utils/logger"
// import { InngestFunction} from "inngest";
import { connectDB } from "./utils/db";
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import authRoutes from "./routes/auth"
import { errorHandler } from "./middleware/errorHandler";


const app = express();

//middleware
app.use(cors())
app.use(helmet()) //prevent cross side scripting
app.use(morgan("dev")) //http request logger middleware
app


const PORT = 3001

app.use(express.json());

// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions: inggestFunctions}));

app.get("/",(req:Request,res:Response) => {
    res.send("Hello Backend")
})

app.get("/api/chat",(req:Request,res:Response) => {
    res.send("Hello, how may I help you today?")
})


//routes
app.use("/auth",authRoutes)

//error handling
app.use(errorHandler)
const startServer = async () => {
    try{
        await connectDB();
        const PORT = process.env.PORT || 3001;
        app.listen(PORT,() => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(
                `Inngest endpoint available at http://localhost:${PORT}/api/inngest`
            )
        })
    }catch(error){
        logger.error("Failed to start server:",error);
        process.exit(1)
    }
}

startServer();
// app.listen(PORT,()=> {
//     console.log(`Server is running on port ${PORT}`);
    
// })