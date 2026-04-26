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
    
    console.log('DELETE API called with id:', id)
    console.log('Environment check:', {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.SUPABASE_ANON_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasUrl: !!process.env.SUPABASE_URL || !!process.env.NEXT_PUBLIC_SUPABASE_URL
    })

    if (!id) {
      console.log('DELETE: No id provided')
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      console.log('DELETE: Invalid id format:', id)
      return NextResponse.json(
        { error: 'Invalid id format' },
        { status: 400 }
      )
    }
    console.log('DELETE: Parsed id:', numericId)

    // First check if comment exists
    const { data: existing, error: fetchError } = await supabaseServer
      .from('fulfillment_comments')
      .select('id, parent_id, fulfillment_id')
      .eq('id', numericId)
      .single()
    
    console.log('DELETE: Existing comment:', existing, 'Error:', fetchError)

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Comment not found', details: fetchError?.message },
        { status: 404 }
      )
    }

    // If it's a parent comment (not a reply), delete replies first
    if (!existing.parent_id) {
      console.log('DELETE: This is a parent comment, deleting replies first...')
      const { error: replyError } = await supabaseServer
        .from('fulfillment_comments')
        .delete()
        .eq('parent_id', numericId)
      
      if (replyError) {
        console.log('DELETE: Error deleting replies:', replyError)
      } else {
        console.log('DELETE: Replies deleted successfully')
      }
    }

    // Now delete the comment itself
    const { data, error } = await supabaseServer
      .from('fulfillment_comments')
      .delete()
      .eq('id', numericId)
      .select()

    console.log('DELETE: Supabase delete result:', { data, error })

    if (error) {
      console.error('Error deleting comment:', error)
      return NextResponse.json(
        { error: 'Failed to delete comment', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    console.log('DELETE: Success, rows deleted:', data?.length || 0)
    return NextResponse.json({ success: true, deleted: data?.length || 0 }, { status: 200 })
  } catch (err) {
    console.error('Unexpected error in DELETE:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
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
