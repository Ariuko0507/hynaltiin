import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET - Fetch meetings (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let query = supabaseServer
      .from('meetings')
      .select(`
        *,
        organizer:users(id, name)
      `)
      .order('meeting_date', { ascending: true });

    // Filter based on role
    if (userRole === 'employee') {
      // Employees see only their own meetings
      query = query.eq('organizer_id', userId);
    } else if (userRole === 'manager') {
      // Managers see all meetings (or could filter by team)
      // For now, show all meetings
      query = query;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching meetings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ meetings: data });
  } catch (error) {
    console.error('Error in GET /api/meetings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, status, meeting_date, location, organizer_id, team_id } = body;

    if (!title || !meeting_date || !organizer_id) {
      return NextResponse.json(
        { error: 'Title, meeting date, and organizer ID are required' },
        { status: 400 }
      );
    }

    // Generate meeting code
    const meeting_id = `M-${Date.now().toString().slice(-6)}`;

    const { data, error } = await supabaseServer
      .from('meetings')
      .insert({
        meeting_id,
        title,
        description,
        status: status ?? 'Төлөвлөсөн',
        organizer_id,
        meeting_date,
        location,
        team_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meeting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ meeting: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/meetings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
