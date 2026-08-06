import { NextResponse } from "next/server";
import { sendTwilioMessage } from "@/lib/twilio";

export async function POST(request: Request) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json({ error: "Missing 'to' or 'message'" }, { status: 400 });
    }

    const result = await sendTwilioMessage(to, message);

    return NextResponse.json({ success: true, sid: result.sid });
  } catch (error: any) {
    console.error("Twilio Test Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
