import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// GET /api/comments?fulfillment_id=F-001
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fulfillmentId = searchParams.get('fulfillment_id')

    if (!fulfillmentId) {
      return NextResponse.json(
        { error: 'fulfillment_id is required' },
        { status: 400 }
      )
    }

    // Fetch all comments for this fulfillment
    const { data: comments, error } = await supabaseServer
      .from('fulfillment_comments')
      .select('*')
      .eq('fulfillment_id', fulfillmentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    // Organize into parent comments and replies
    interface CommentRow {
      id: number
      fulfillment_id: string
      author: string
      role: string
      text: string
      parent_id: number | null
      created_at: string
    }

    const typedComments = (comments || []) as CommentRow[]
    const parentComments = typedComments.filter((c: CommentRow) => !c.parent_id)
    const replies = typedComments.filter((c: CommentRow) => c.parent_id)

    const organizedComments = parentComments.map((parent: CommentRow) => ({
      ...parent,
      replies: replies.filter((reply: CommentRow) => reply.parent_id === parent.id)
    }))

    return NextResponse.json({ comments: organizedComments })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/comments - Add new comment or reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fulfillment_id, author, role, text, parent_id } = body

    if (!fulfillment_id || !author || !role || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('fulfillment_comments')
      .insert({
        fulfillment_id,
        author,
        role,
        text,
        parent_id: parent_id || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting comment:', error)
      return NextResponse.json(
        { error: 'Failed to add comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ comment: data }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/comments?id=123 - Delete comment by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseServer
      .from('fulfillment_comments')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('Error deleting comment:', error)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/comments?id=123 - Update comment by ID
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { text } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('fulfillment_comments')
      .update({ text: text.trim() })
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      console.error('Error updating comment:', error)
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ comment: data }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
