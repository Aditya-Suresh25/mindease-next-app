"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functions = exports.inngest = void 0;
const inngest_1 = require("inngest");
// Create a client to send and receive events
// In production, Inngest will use INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY from environment
exports.inngest = new inngest_1.Inngest({
    id: "ai-therapy-agent",
    // Event key is automatically read from INNGEST_EVENT_KEY env var in production
});
// Create an empty array where we'll export future Inngest functions
exports.functions = [];
