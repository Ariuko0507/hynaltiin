import { redirect } from 'next/navigation';

export default function LeaderPage() {
  // Redirect to dashboard as the default page
  redirect('/leader/dashboard');
}
