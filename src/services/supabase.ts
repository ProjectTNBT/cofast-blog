import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

export const supabaseUrl = 'https://sltvoqiwpyieyyplhmcm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdHZvcWl3cHlpZXl5cGxobWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEyNDk1MjIsImV4cCI6MjAzNjgyNTUyMn0.8Nd4E1RH2ArC1HBdUkj0-26RMBGw13RogcomxVYUm7U';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase;
