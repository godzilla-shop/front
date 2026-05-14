import { auth } from '@/lib/firebase';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    const buildHeaders = async (forceRefresh: boolean): Promise<Record<string, string>> => {
        const user = auth.currentUser;
        const token = user ? await user.getIdToken(forceRefresh) : null;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (options.body instanceof FormData) delete headers['Content-Type'];

        return headers;
    };

    const res = await fetch(`${baseUrl}${cleanPath}`, {
        ...options,
        headers: await buildHeaders(false),
    });

    // Si el token expiró, reintentar una vez con token fresco
    if (res.status === 401) {
        return fetch(`${baseUrl}${cleanPath}`, {
            ...options,
            headers: await buildHeaders(true),
        });
    }

    return res;
}
