// src/app/test-db/TestDBClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function TestDBClient() {
    const router = useRouter();
    const [getResult, setGetResult] = useState<any>(null);
    const [postResult, setPostResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function checkUser() {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;
                setUser(user);
            } catch (error) {
                console.error('Auth check error:', error);
                router.push('/auth/sign-in');
            } finally {
                setLoading(false);
            }
        }
        checkUser();
    }, [router]);

    if (loading) {
        return (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F3522F] mx-auto"></div>
        );
    }

    // Rest of your component code...
    // (All the functions and JSX remain the same)
}