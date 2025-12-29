const express = require('express')
import {Request,Response} from "express"
import {serve} from "inngest/express"
import { inngest,functions } from "./inngest";

const app = express();
const PORT = 3001

app.use(express.json());

// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/",(req:Request,res:Response) => {
    res.send("Hello Backend")
})

app.get("/api/chat",(req:Request,res:Response) => {
    res.send("Hello, how may I help you today?")
})

app.listen(PORT,()=> {
    console.log(`Server is running on port ${PORT}`);
    
})