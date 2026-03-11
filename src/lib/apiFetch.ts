import { auth } from '@/lib/firebase';

/**
 * Authenticated fetch wrapper.
 * Automatically attaches the Firebase ID token to every request.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (multipart), let the browser set it
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    return fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
    });
}
