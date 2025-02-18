// src/app/auth/update-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { theme, styles } from '@/styles/theme';
import { colors } from '@/styles/theme/base';

export default function UpdatePassword() {
    const [mounted, setMounted] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Password validation (same as sign-up)
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

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setNewPassword(password);
        setValidationError(validatePassword(password));
    };

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Validate new password
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setValidationError(passwordError);
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
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
                        Update Password
                    </h1>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                            Password updated successfully!
                        </div>
                    )}

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-3">
                            <div className="relative">
                                <div className="h-[42px] flex items-end pb-2">
                                    <label htmlFor="newPassword" className="block text-lg font-medium text-text-light">
                                        New Password
                                    </label>
                                </div>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={handleNewPasswordChange}
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
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => router.back()}
                            className="text-sm text-[#F3522F] hover:text-[#f4633f] transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}