import { Request, Response } from "express";
import { ReflectionReport } from "../models/ReflectionReport";
import { inngest } from "../inngest/index";
import { Types } from "mongoose";

export const generateReport = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const { period, isMock } = req.body; // "7_days", "14_days", etc.

        let days = 7;
        if (period === "14_days") days = 14;
        if (period === "30_days") days = 30;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Trigger Inngest Event
        await inngest.send({
            name: "report/generated.requested",
            data: {
                userId,
                period,
                startDate,
                endDate,
                isMock: !!isMock
            },
            user: { id: userId }
        });

        res.status(202).json({ message: "Report generation started" });
    } catch (error) {
        console.error("Error triggering report:", error);
        res.status(500).json({ message: "Failed to start generation" });
    }
};

export const getReports = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const reports = await ReflectionReport.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20); // Limit to last 20 reports

        res.json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Failed to fetch reports" });
    }
};

export const getReportById = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const report = await ReflectionReport.findOne({ _id: id, userId });
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: "Error fetching report" });
    }
};
