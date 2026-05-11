export function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'Эхэлсэн': 'bg-blue-100 text-blue-800',
    'Зассан': 'bg-yellow-100 text-yellow-800',
    'Эсхийг': 'bg-red-100 text-red-800',
    'Төлөвлөсөн': 'bg-gray-100 text-gray-800',
    'Баталгаажсан': 'bg-green-100 text-green-800',
    'Цуцлагдсан': 'bg-red-100 text-red-800',
    'Илгээсэн': 'bg-blue-100 text-blue-800',
    'Буцаасан': 'bg-orange-100 text-orange-800',
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800'
  }
  
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

export function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    'director': 'bg-purple-100 text-purple-800',
    'manager': 'bg-emerald-100 text-emerald-800',
    'department_head': 'bg-sky-100 text-sky-800',
    'team_leader': 'bg-amber-100 text-amber-800',
    'employee': 'bg-gray-100 text-gray-800'
  }
  
  return roleColors[role] || 'bg-gray-100 text-gray-800'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT'
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('mn-MN').format(num)
}
