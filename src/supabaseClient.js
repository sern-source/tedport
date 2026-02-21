import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gsdbutprqfnxjtppwwhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZGJ1dHBycWZueGp0cHB3d2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTE0NDgsImV4cCI6MjA3OTU4NzQ0OH0.jls3ReKBV5vRljairmDd72OzAYGl6qHCewjA6P_RAq8';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
