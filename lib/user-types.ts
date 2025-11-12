export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string | null
  company?: string | null
  google_id?: string | null
  avatar_url?: string | null
  created_at: Date
  updated_at: Date
}
