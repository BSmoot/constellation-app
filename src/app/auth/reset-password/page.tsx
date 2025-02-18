// src/app/auth/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { theme, styles } from '@/styles/theme';
import { colors } from '@/styles/theme/base';

export default function ResetPassword() {
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            });

            if (error) throw error;

            setSuccess(true);
            // Redirect to sign-in page after 3 seconds
            setTimeout(() => {
                router.push('/auth/sign-in');
            }, 3000);
            
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#E9F1F7]">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto px-4 py-8 bg-[#E9F1F7]">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-6">
                        Reset Password
                    </h1>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                            Password reset link has been sent to your email. 
                            Redirecting to sign in page...
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-3">
                                <div className="relative">
                                    <div className="h-[56px] flex items-end pb-2">
                                        <label htmlFor="email" className="block text-lg font-medium text-text-light">
                                            Email
                                        </label>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 h-[48px] border border-[#232C33]
                                                border-opacity-50 rounded-lg
                                                bg-white/90 backdrop-blur-sm focus:outline-none
                                                focus:border-[#232C33] transition-colors duration-200
                                                text-text-light shadow-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center px-6 py-3
                                        bg-[#F3522F] text-white rounded-lg
                                        hover:bg-[#f4633f] transition-colors duration-200
                                        disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => router.push('/auth/sign-in')}
                            className="text-sm text-[#F3522F] hover:text-[#f4633f] transition-colors"
                        >
                            Back to Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}