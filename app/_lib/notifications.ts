import { supabase } from "@/lib/supabase";

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching notification count:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return 0;
  }
}

export async function createNotification(
  userId: number,
  title: string,
  message: string,
  type: string = "info",
  link?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link,
        is_read: false,
      });

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

export async function notifyManagers(
  managerIds: number[],
  title: string,
  message: string,
  type: string = "info",
  link?: string
): Promise<void> {
  for (const managerId of managerIds) {
    await createNotification(managerId, title, message, type, link);
  }
}
