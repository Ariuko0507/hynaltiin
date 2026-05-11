import { supabase } from "@/lib/supabase";

// Database helper functions for common operations

export async function getUserById(userId: number) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function getDepartments() {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching departments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
}

export async function getUsersByRole(role: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('position', role)
      .order('name');

    if (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
}

export async function getUsersByDepartment(departmentId: number) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('department_id', departmentId)
      .order('name');

    if (error) {
      console.error('Error fetching users by department:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching users by department:', error);
    return [];
  }
}

export async function getTasksForUser(userId: number) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks for user:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    return [];
  }
}

export async function getFulfillmentsForUser(userId: number) {
  try {
    const { data, error } = await supabase
      .from('fulfillments')
      .select('*')
      .eq('sent_to', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fulfillments for user:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching fulfillments for user:', error);
    return [];
  }
}

export async function getMeetingsForUser(userId: number, userRole?: string) {
  try {
    let query = supabase
      .from('meetings')
      .select('*')
      .order('meeting_date', { ascending: true });

    // If user is a director or manager, show all meetings
    if (userRole && ['director', 'manager'].includes(userRole)) {
      // No additional filtering needed
    } else {
      // For other roles, only show meetings where they are participants or organizer
      query = query.or(`organizer.eq.${userId},participants.cs.{${userId}}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching meetings for user:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching meetings for user:', error);
    return [];
  }
}

export async function createTask(taskData: any) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

export async function updateTask(taskId: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

export async function createFulfillment(fulfillmentData: any) {
  try {
    const { data, error } = await supabase
      .from('fulfillments')
      .insert(fulfillmentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating fulfillment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating fulfillment:', error);
    return null;
  }
}

export async function updateFulfillment(fulfillmentId: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('fulfillments')
      .update(updates)
      .eq('id', fulfillmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating fulfillment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating fulfillment:', error);
    return null;
  }
}

export async function createMeeting(meetingData: any) {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .insert(meetingData)
      .select()
      .single();

    if (error) {
      console.error('Error creating meeting:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    return null;
  }
}

export async function updateMeeting(meetingId: number, updates: any) {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', meetingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating meeting:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating meeting:', error);
    return null;
  }
}

// Get organizational hierarchy
export async function getOrganizationalHierarchy() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, email, position,
        department_id,
        manager_id,
        departments(name, code),
        manager:users!manager_id(name, email, position)
      `)
      .eq('status', 'active')
      .order('position');

    if (error) {
      console.error('Error fetching organizational hierarchy:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching organizational hierarchy:', error);
    return [];
  }
}
