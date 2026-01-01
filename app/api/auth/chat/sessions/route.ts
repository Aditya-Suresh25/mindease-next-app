import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    // forward body and auth header to backend
    const resp = await fetch(`${BACKEND_API_URL}/chat/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: await req.text(),
    });

    const data = await resp.text();
    const status = resp.status;
    const contentType = resp.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return NextResponse.json(JSON.parse(data), { status });
    }
    return new NextResponse(data, { status, headers: { "Content-Type": contentType } });
  } catch (error) {
    console.error("Error creating chat session (proxy):", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}


