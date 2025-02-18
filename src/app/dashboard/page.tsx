// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Constellation {
    id: string;
    name: string;
    created_at: string;
    // Add more properties as needed
}

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [constellations, setConstellations] = useState<Constellation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push('/auth/sign-in');
                return;
            }
            // Once we have user, fetch their constellations
            fetchConstellations();
        } catch (error) {
            console.error('Error checking user:', error);
            router.push('/auth/sign-in');
        }
    }

    async function fetchConstellations() {
        try {
            // This is a placeholder until we create the constellations table
            // const { data, error } = await supabase
            //     .from('constellations')
            //     .select('*')
            //     .order('created_at', { ascending: false });

            // if (error) throw error;
            // setConstellations(data);

            // Placeholder data
            setConstellations([
                {
                    id: '1',
                    name: 'My First Constellation',
                    created_at: new Date().toISOString(),
                }
            ]);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#E9F1F7]">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Your Constellations
                    </h1>
                    <button
                        onClick={() => router.push('/onboarding/step-one')}
                        className="px-4 py-2 bg-[#F3522F] text-white rounded-lg
                                hover:bg-[#f4633f] transition-colors duration-200"
                    >
                        Create New
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F3522F] mx-auto"></div>
                    </div>
                ) : constellations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500 mb-4">You haven't created any constellations yet.</p>
                        <button
                            onClick={() => router.push('/onboarding/step-one')}
                            className="text-[#F3522F] hover:text-[#f4633f] transition-colors"
                        >
                            Start your first constellation
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {constellations.map((constellation) => (
                            <div
                                key={constellation.id}
                                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <h2 className="text-xl font-medium text-gray-900 mb-2">
                                    {constellation.name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Created {new Date(constellation.created_at).toLocaleDateString()}
                                </p>
                                <button
                                    onClick={() => router.push(`/constellation/${constellation.id}`)}
                                    className="mt-4 text-[#F3522F] hover:text-[#f4633f] transition-colors"
                                >
                                    View Details →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}