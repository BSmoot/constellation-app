'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { theme, styles } from '@/styles/theme';
import { colors } from '@/styles/theme/base';

export default function SignIn() {
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render anything until mounted
    if (!mounted) {
        return null;
    }
    
    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
    
            if (error) throw error;
    
            if (data.user) {
                // Check if there's a redirect URL in localStorage
                const redirectUrl = localStorage.getItem('authRedirectUrl');
                if (redirectUrl) {
                    localStorage.removeItem('authRedirectUrl');
                    router.push(redirectUrl);
                } else {
                    router.push('/dashboard');
                }
                router.refresh();
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#E9F1F7]">
            <div className="max-w-4xl mx-auto px-4 py-8">

                <div className="max-w-4xl mx-auto px-4 py-8 bg-[#E9F1F7]">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-6">
                        Sign In
                    </h1>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignIn} className="space-y-4">
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

                        <div className="space-y-3">
                            <div className="relative">
                                <div className="h-[42px] flex items-end pb-2">
                                    <label htmlFor="password" className="block text-lg font-medium text-text-light">
                                        Password
                                    </label>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => router.push('/auth/reset-password')}
                            className="text-sm text-[#F3522F] hover:text-[#f4633f] transition-colors"
                        >
                            Forgot your password?
                        </button>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-text-light">
                            Don't have an account?{' '}
                            <button
                                onClick={() => router.push('/auth/sign-up')}
                                className="text-[#F3522F] hover:text-[#f4633f] transition-colors"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}