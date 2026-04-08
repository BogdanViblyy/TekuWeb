// app/auth/login/page.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '@/app/actions';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

function SubmitButton({ text, loadingText }: { text: string, loadingText: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:bg-gray-400">
      {pending ? loadingText : text}
    </button>
  );
}

// FIX: Correct initial state for useFormState
const initialState = { success: false, message: '' };

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState);
  const tAuth = useTranslations('auth');

  // Redirect is now handled inside the server action itself, so useEffect is not needed here.

  return (
    <div className="flex items-center justify-center min-h-screen pt-[var(--header-total-height)] pb-12 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center">{tAuth('loginTitle')}</h1>
        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">{tAuth('email')} or {tAuth('username')}</label>
            <input id="identifier" name="identifier" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{tAuth('password')}</label>
            <input id="password" name="password" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
          </div>
          {state?.message && !state?.success && <p className="text-red-500 text-sm">{state.message}</p>}
          <SubmitButton text={tAuth('loginButton')} loadingText={tAuth('loggingIn')} />
        </form>
        <p className="text-center text-sm">
          {tAuth('noAccount')}{' '}
          <Link href="/auth/register" className="font-medium text-black hover:underline">
            {tAuth('registerTitle')}
          </Link>
        </p>
      </div>
    </div>
  );
}