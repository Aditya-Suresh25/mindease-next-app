import { NextFunction, Request,Response } from "express";
import { logger } from "../utils/logger";
import { err } from "inngest/types";

export class AppError extends Error {
    statusCode:number;
    status:string;
    isOperational:boolean;
    constructor(message:string,statusCode:number){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`;
        this.isOperational = true;

        Error.captureStackTrace(this,this.constructor)
    }
}

export const errorHandler = (
    err:Error | AppError,
    req:Request,
    res:Response,
    next:NextFunction
) => {
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            status:err.status,
            message:err.message,
        })
    }
    //log unexpected errors
    logger.error("Unexpected error:",err)
    
    return res.status(500).json({
        status:"error",
        message:"Something went wrong",
    })
}
