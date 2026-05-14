import { redirect } from 'next/navigation';

export default function DepartmentHeadPage() {
  // Redirect to dashboard as the default page
  redirect('/department_head/dashboard');
}
