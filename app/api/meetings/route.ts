import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createAuditLog, createNotificationRow, getRequestIp, getUserLite, makeCode } from "@/lib/server-workflow";

// GET - Fetch meetings visible to a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = Number(searchParams.get("userId"));

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Valid userId is required" }, { status: 400 });
    }

    const actor = await getUserLite(userId);
    if (!actor) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let query = supabaseServer
      .from("meetings")
      .select(
        `
        *,
        meeting_type:meeting_types(id, name, description),
        organizer:users(id, name, position)
      `,
      )
      .order("meeting_date", { ascending: true });

    if (actor.position !== "manager" && actor.position !== "director1" && actor.position !== "director2") {
      const { data: attendeeRows, error: attendeeError } = await supabaseServer
        .from("meeting_attendees")
        .select("meeting_id")
        .eq("user_id", actor.id);

      if (attendeeError) {
        return NextResponse.json({ error: attendeeError.message }, { status: 500 });
      }

      const meetingIds = (attendeeRows ?? []).map((row) => row.meeting_id);
      if (meetingIds.length === 0) {
        return NextResponse.json({ meetings: [] });
      }

      query = query.in("id", meetingIds);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ meetings: data ?? [] });
  } catch (error) {
    console.error("Error in GET /api/meetings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a meeting (manager only, meeting type mandatory, recording mandatory)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      agenda,
      meeting_date,
      location,
      organizer_id,
      meeting_type_id,
      attendee_ids,
      recording,
    } = body as {
      title?: string;
      description?: string;
      agenda?: string;
      meeting_date?: string;
      location?: string;
      organizer_id?: number;
      meeting_type_id?: number;
      attendee_ids?: number[];
      recording?: {
        file_path?: string;
        public_url?: string;
        file_size?: number | null;
        duration_seconds?: number | null;
        recording_type?: "video" | "audio";
        transcription?: string | null;
      };
    };

    if (!title?.trim() || !meeting_date || !organizer_id || !meeting_type_id) {
      return NextResponse.json(
        { error: "title, meeting_date, organizer_id, and meeting_type_id are required" },
        { status: 400 },
      );
    }

    if (!recording?.file_path?.trim()) {
      return NextResponse.json(
        { error: "A meeting recording is mandatory. Provide recording.file_path." },
        { status: 400 },
      );
    }

    const organizer = await getUserLite(organizer_id);
    if (!organizer) {
      return NextResponse.json({ error: "Organizer not found" }, { status: 404 });
    }
    if (organizer.position !== "manager") {
      return NextResponse.json({ error: "Only manager can create meetings" }, { status: 403 });
    }

    const { data: typeRow, error: typeError } = await supabaseServer
      .from("meeting_types")
      .select("id")
      .eq("id", meeting_type_id)
      .single();
    if (typeError || !typeRow) {
      return NextResponse.json({ error: "Invalid meeting_type_id" }, { status: 400 });
    }

    const meetingCode = makeCode("MTG");
    const { data: meeting, error: meetingError } = await supabaseServer
      .from("meetings")
      .insert({
        meeting_code: meetingCode,
        meeting_type_id,
        title: title.trim(),
        description: description ?? null,
        agenda: agenda ?? null,
        organizer_id,
        meeting_date,
        location: location ?? null,
        status: "scheduled",
      })
      .select()
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: meetingError?.message ?? "Failed to create meeting" }, { status: 500 });
    }

    const attendeeIds = Array.isArray(attendee_ids)
      ? [...new Set(attendee_ids.filter((id) => Number.isFinite(id)))]
      : [];

    if (attendeeIds.length > 0) {
      const attendeePayload = attendeeIds.map((userId) => ({
        meeting_id: meeting.id,
        user_id: userId,
        attended: false,
      }));
      await supabaseServer.from("meeting_attendees").insert(attendeePayload);
    }

    await supabaseServer.from("meeting_recordings").insert({
      meeting_id: meeting.id,
      user_id: organizer_id,
      file_path: recording.file_path.trim(),
      public_url: recording.public_url ?? null,
      file_size: recording.file_size ?? null,
      duration_seconds: recording.duration_seconds ?? null,
      recording_type: recording.recording_type ?? "video",
      transcription: recording.transcription ?? null,
    });

    for (const attendeeId of attendeeIds) {
      await createNotificationRow({
        userId: attendeeId,
        title: "Хурал товлогдлоо",
        message: `Танд "${title.trim()}" хурлын урилга ирлээ.`,
        type: "meeting",
        link: `/manager/meeting?meetingId=${meeting.id}`,
      });
    }

    await createAuditLog({
      userId: organizer_id,
      action: "meeting_created",
      objectType: "meeting",
      objectId: meeting.id,
      details: {
        meeting_code: meetingCode,
        meeting_type_id,
        attendee_count: attendeeIds.length,
      },
      ipAddress: getRequestIp(request),
    });

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/meetings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
