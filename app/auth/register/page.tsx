// app/auth/register/page.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { register } from '@/app/actions';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:bg-gray-400">
      {pending ? 'Creating Account...' : 'Create Account'}
    </button>
  );
}

// FIX: Correct initial state for useFormState
const initialState = { success: false, message: '' };

export default function RegisterPage() {
    const [state, formAction] = useFormState(register, initialState);
  
    // Redirect is handled inside the server action
    
    return (
        <div className="flex items-center justify-center min-h-screen-minus-header bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center">Create an Account</h1>
                <form action={formAction} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Username</label>
                        <input id="name" name="name" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input id="email" name="email" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input id="password" name="password" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                    </div>
                    {state?.message && !state?.success && <p className="text-red-500 text-sm">{state.message}</p>}
                    <SubmitButton />
                </form>
                <p className="text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-medium text-black hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}