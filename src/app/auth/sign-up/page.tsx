// src/app/auth/sign-up/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { theme, styles } from '@/styles/theme';
import { colors } from '@/styles/theme/base';

export default function SignUp() {
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Password validation
    const validatePassword = (pass: string) => {
        if (pass.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[A-Z]/.test(pass)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[a-z]/.test(pass)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/[0-9]/.test(pass)) {
            return "Password must contain at least one number";
        }
        if (!/[!@#$%^&*]/.test(pass)) {
            return "Password must contain at least one special character (!@#$%^&*)";
        }
        return null;
    };

    // Handle password change with validation
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setValidationError(validatePassword(newPassword));
    };

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate password before submission
        const passwordError = validatePassword(password);
        if (passwordError) {
            setValidationError(passwordError);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/test-db`,
                }
            });

            if (error) throw error;

            if (data.user) {
                // Show success message
                alert("Please check your email to verify your account!");
                router.push('/auth/sign-in');
            }
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
                        Sign Up
                    </h1>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-4">
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
                                    onChange={handlePasswordChange}
                                    required
                                    className={`w-full px-4 py-3 h-[48px] border 
                                            ${validationError ? 'border-red-500' : 'border-[#232C33]'}
                                            border-opacity-50 rounded-lg
                                            bg-white/90 backdrop-blur-sm focus:outline-none
                                            focus:border-[#232C33] transition-colors duration-200
                                            text-text-light shadow-sm`}
                                />
                                {validationError && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {validationError}
                                    </p>
                                )}
                            
                                <div className="mt-2 text-sm text-gray-500">
                                    <ul className="list-disc ml-5 space-y-1">
                                        
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !!validationError}
                            className="w-full flex justify-center px-6 py-3
                                    bg-[#F3522F] text-white rounded-lg
                                    hover:bg-[#f4633f] transition-colors duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-text-light">
                            Already have an account?{' '}
                            <button
                                onClick={() => router.push('/auth/sign-in')}
                                className="text-[#F3522F] hover:text-[#f4633f] transition-colors"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}