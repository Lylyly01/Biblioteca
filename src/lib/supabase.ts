import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  pages: number;
  color: string;
  synopsis: string;
  total_copies: number;
  available_copies: number;
  is_featured: boolean;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rental {
  id: string;
  book_id: string;
  user_id: string | null;
  rental_date: string;
  due_date: string;
  returned: boolean;
  returned_date: string | null;
  created_at: string;
}
