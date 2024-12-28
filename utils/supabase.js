import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

let supabase = null
let supabaseServer = null

if (typeof window !== 'undefined') {
    // Client-side initialization
    if (!supabase) {
        supabase = createClient(supabaseUrl, supabaseAnonKey)
    }
} else {
    // Server-side initialization
    if (!supabaseServer) {
        supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
    }
}

// Export a function to handle auth
export async function handleAuth(email, password, action) {
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, action })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Authentication failed');
        }

        const data = await response.json();
        
        // Set the session in Supabase client
        if (data.session) {
            await supabase.auth.setSession(data.session);
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export { supabase, supabaseServer }
