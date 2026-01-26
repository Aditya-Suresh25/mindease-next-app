"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportById = exports.getReports = exports.generateReport = void 0;
const ReflectionReport_1 = require("../models/ReflectionReport");
const index_1 = require("../inngest/index");
const generateReport = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period, isMock } = req.body; // "7_days", "14_days", etc.
        let days = 7;
        if (period === "14_days")
            days = 14;
        if (period === "30_days")
            days = 30;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        // Trigger Inngest Event
        await index_1.inngest.send({
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
    }
    catch (error) {
        console.error("Error triggering report:", error);
        res.status(500).json({ message: "Failed to start generation" });
    }
};
exports.generateReport = generateReport;
const getReports = async (req, res) => {
    try {
        const userId = req.user._id;
        const reports = await ReflectionReport_1.ReflectionReport.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20); // Limit to last 20 reports
        res.json(reports);
    }
    catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Failed to fetch reports" });
    }
};
exports.getReports = getReports;
const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const report = await ReflectionReport_1.ReflectionReport.findOne({ _id: id, userId });
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching report" });
    }
};
exports.getReportById = getReportById;
