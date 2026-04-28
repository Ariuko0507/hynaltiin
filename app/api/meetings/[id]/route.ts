import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// PUT - Update a meeting (for manager reactions/approvals)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;
    const body = await request.json();
    const { status, manager_reaction, manager_comment } = body;

    const { data, error } = await supabaseServer
      .from('meetings')
      .update({
        status,
        manager_reaction,
        manager_comment,
        manager_reaction_at: manager_reaction ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating meeting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ meeting: data });
  } catch (error) {
    console.error('Error in PUT /api/meetings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;

    const { error } = await supabaseServer
      .from('meetings')
      .delete()
      .eq('id', meetingId);

    if (error) {
      console.error('Error deleting meeting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/meetings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
