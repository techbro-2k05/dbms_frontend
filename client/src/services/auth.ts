// auth.ts
import api, { setAccessToken } from './api';

export async function login(id: number, password: string) {
  try {
    console.log('auth.ts: Calling /auth/login with id:', id, 'password:', password);
    // When calling login, include withCredentials so browser accepts refresh cookie
    const res = await api.post('/auth/login', { id, password }, { withCredentials: true });
    console.log('auth.ts: Login response status:', res.status);
    console.log('auth.ts: Login response data:', res.data);
    console.log('auth.ts: token field:', res.data?.token);
    
    // Backend returns JwtResponse with "token" field
    const token = res.data?.token;
    
    if (!token) {
      console.error('auth.ts: No token found in response!');
      console.error('auth.ts: Full response data:', JSON.stringify(res.data, null, 2));
    }
    
    setAccessToken(token ?? null);
    return token;
  } catch (error: any) {
    console.error('auth.ts: Login error:', error);
    console.error('auth.ts: Error response:', error.response?.data);
    console.error('auth.ts: Error status:', error.response?.status);
    throw error; // Re-throw so AuthContext can catch it
  }
}

export async function tryRefresh() {
  // Called on app startup to get an access token if cookie is present
  try {
    const res = await api.post('/auth/refresh', {}, { withCredentials: true });
    // Backend returns JwtResponse with "token" field
    const token = res.data?.token;
    setAccessToken(token ?? null);
    return token;
  } catch (err) {
    setAccessToken(null);
    return null;
  }
}

export function logoutLocal() {
  console.log('auth.ts: Clearing access token from memory');
  setAccessToken(null);
  console.log('auth.ts: Access token cleared');
}

// Optionally: call a server endpoint to clear cookie (you need a backend /auth/logout)
export async function logoutServer() {
  await api.post('/auth/logout', {}, { withCredentials: true });
  setAccessToken(null);
}
