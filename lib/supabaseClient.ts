import { createClient } from '@supabase/supabase-js';

// Your project's specific Supabase URL and anon key
const supabaseUrl = 'https://jsubnmdqdimuancikpmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzdWJubWRxZGltdWFuY2lrcG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTY5ODEsImV4cCI6MjA2ODI3Mjk4MX0.C3HtmQq1oJlGuIvMgegci4yKd8jN2tYq62XJyNq74SU';

// --- Create and export the Supabase client ---
// This client is now connected to your project.
// For a production application, you would store these keys in environment variables
// for better security, but this is perfect for local development.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);