import { supabaseServer } from '../../utils/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password, action } = req.body;

    try {
        if (action === 'signup') {
            const { data, error } = await supabaseServer.auth.signUp({
                email,
                password,
            });

            if (error) throw error;
            return res.status(200).json({ session: data.session, user: data.user });
        }

        if (action === 'signin') {
            const { data, error } = await supabaseServer.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return res.status(200).json({ session: data.session, user: data.user });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({ error: error.message });
    }
}
