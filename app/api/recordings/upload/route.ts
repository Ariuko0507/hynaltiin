import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const { meetingId, userId, filePath, publicUrl, fileSize, duration } = await request.json();

    const { data, error } = await supabaseAdmin
      .from("meeting_recordings")
      .insert({
        meeting_id: meetingId,
        user_id: userId,
        file_path: filePath,
        public_url: publicUrl,
        file_size: fileSize,
        duration_seconds: duration,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
