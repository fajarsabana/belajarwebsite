// Import Supabase client
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Your Supabase credentials (Replace these with yours)
const SUPABASE_URL = "https://jqueqchgsazhompvfifr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxdWVxY2hnc2F6aG9tcHZmaWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NzM5MDIsImV4cCI6MjA1NjU0OTkwMn0.8q1m-jIL4kRgck4pwDfOYFHgFMSg2BIfBSTgIWBc_PE";

// Initialize Supabase client
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to fetch location data
export async function fetchLocations() {
    let { data, error } = await supabaseClient
        .from("your_table_name") // Replace with your actual table name
        .select("name, latitude, longitude");

    if (error) {
        console.error("Error fetching data:", error);
        return [];
    }

    return data;
}

