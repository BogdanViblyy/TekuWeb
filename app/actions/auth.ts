// app/actions/auth.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify, SignJWT, JWTPayload } from 'jose';
import * as bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { User } from '@/types';
import { jwtSecret } from '@/lib/env';
import { mergeGuestCartToUser } from './cart';

const secret = jwtSecret;

// --- Auth Actions ---

export async function getSession(): Promise<User | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, secret);
        if (typeof payload.id === 'number' && typeof payload.name === 'string' && typeof payload.email === 'string') {
            return { id: payload.id, name: payload.name, email: payload.email };
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function createSession(userPayload: User) {
    const cookieStore = await cookies();
    const guestCartIdStr = cookieStore.get('guestCartId')?.value;
    const guestCartId = guestCartIdStr ? parseInt(guestCartIdStr, 10) : null;

    const payload: JWTPayload = { ...userPayload };

    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(secret);

    cookieStore.set('session_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });

    if (guestCartId && !isNaN(guestCartId)) {
        await mergeGuestCartToUser(guestCartId, userPayload.id);
        cookieStore.delete('guestCartId');
    }
}

export async function register(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password || password.length < 6) {
        return { success: false, message: 'Invalid data provided.' };
    }

    const existingEmail = await prisma.users.findUnique({ where: { user_email: email } });
    if (existingEmail) return { success: false, message: 'User with this email already exists.' };

    const existingName = await prisma.users.findUnique({ where: { user_name: name } });
    if (existingName) return { success: false, message: 'This username is already taken.' };

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
        data: {
            user_name: name,
            user_email: email,
            user_password: hashedPassword,
        }
    });

    const userPayload: User = { id: newUser.user_id, name: newUser.user_name || '', email: newUser.user_email || '' };
    await createSession(userPayload);

    redirect('/profile');
}

export async function login(prevState: any, formData: FormData) {
    const identifier = formData.get('identifier') as string;
    const password = formData.get('password') as string;

    if (!identifier || !password) {
        return { success: false, message: 'Please provide both identifier and password.' };
    }

    const user = await prisma.users.findFirst({
        where: { OR: [{ user_email: identifier }, { user_name: identifier }] }
    });

    if (!user || !user.user_password) {
        return { success: false, message: 'Invalid credentials.' };
    }

    const passwordMatches = await bcrypt.compare(password, user.user_password);
    if (!passwordMatches) {
        return { success: false, message: 'Invalid credentials.' };
    }

    const userPayload: User = { id: user.user_id, name: user.user_name || '', email: user.user_email || '' };
    await createSession(userPayload);

    redirect('/profile');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
    redirect('/');
}
