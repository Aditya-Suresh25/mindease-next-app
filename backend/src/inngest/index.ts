import { Inngest } from "inngest";

// Create a client to send and receive events
// In production, Inngest will use INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY from environment
export const inngest = new Inngest({ 
  id: "ai-therapy-agent",
  // Event key is automatically read from INNGEST_EVENT_KEY env var in production
});

// Create an empty array where we'll export future Inngest functions
export const functions = [];