import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    if (!department) {
      return NextResponse.json({ error: 'Department parameter is required' }, { status: 400 });
    }

    // For now, return mock data since the table might not exist
    const mockData = [
      {
        id: 1,
        meeting_id: "DM-001",
        title: "Хэлтсийн сарын уулзалт",
        status: "Төлөвлөсөн",
        organizer: "Албаны дарга Бат",
        organizer_id: 2,
        date: "2026-05-15 14:00",
        location: "Хэлтсийн танхим 301",
        description: "Сарын гүйцэтгэл, төлөвлөт, илэрсэн асуудлуудыг хэлэлцэх.",
        department: "Хяналт шалгалтын хэлтэс",
      },
      {
        id: 2,
        meeting_id: "DM-002", 
        title: "Багийн ахлагчдын уулзалт",
        status: "Баталгаажсан",
        organizer: "Албаны дарга Бат",
        organizer_id: 2,
        date: "2026-05-10 10:00",
        location: "Онлайн (Zoom)",
        description: "Багийн ахлагчдын тайлан, гүйцэтгэлийн талаар хэлэлцэх.",
        department: "Хяналт шалгалтын хэлтэс",
      },
      {
        id: 3,
        meeting_id: "DM-003",
        title: "Шинэ төсөгчийн уулзалт", 
        status: "Цуцлагдсан",
        organizer: "Албаны дарга Бат",
        organizer_id: 2,
        date: "2026-05-08 16:00",
        location: "Хэлтсийн танхим 301",
        description: "Шинээр төсөгдсөн ажилтантай танилцах, ажлын орчин танилцуулах.",
        department: "Хяналт шалгалтын хэлтэс",
      }
    ];

    return NextResponse.json({
      success: true,
      meetings: mockData.filter(meeting => meeting.department === department)
    });

  } catch (error) {
    console.error('Error fetching department meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, status, date, location, description, department, organizer_id, organizer } = body;

    if (!title || !status || !date || !location || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create mock meeting response (in real implementation, save to database)
    const newMeeting = {
      id: Date.now(),
      meeting_id: `DM-${Date.now().toString().slice(-3)}`,
      title,
      status,
      date,
      location,
      description,
      department,
      organizer_id,
      organizer,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      meeting: newMeeting
    });

  } catch (error) {
    console.error('Error creating department meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create department meeting' },
      { status: 500 }
    );
  }
}
