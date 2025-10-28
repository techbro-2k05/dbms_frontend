import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080';

let inMemoryAccessToken: string | null = null;
export const setAccessToken = (token: string | null) => { inMemoryAccessToken = token; };
export const getAccessToken = () => inMemoryAccessToken;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // IMPORTANT: so cookies (refresh token) are sent
});

// Request interceptor: add Authorization if we have an access token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 by calling /auth/refresh and retrying
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}
function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  r => r,
  (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // If 401 and not already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      // Important: use plain axios (not api) to avoid interceptors loop
      return new Promise((resolve, reject) => {
        axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
          .then(res => {
            // Backend returns JwtResponse with "token" field
            const newToken = res.data?.token || res.data?.accessToken || res.data?.access_token || null;
            setAccessToken(newToken);
            if (newToken) {
              api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            } else {
              delete api.defaults.headers.common['Authorization'];
            }
            onRefreshed(newToken);
            originalRequest.headers['Authorization'] = newToken ? `Bearer ${newToken}` : undefined;
            resolve(api(originalRequest));
          })
          .catch(err => {
            // refresh failed -> propagate error (user needs to login)
            console.log('api.ts: Token refresh failed, user needs to re-login');
            setAccessToken(null);
            reject(err);
          })
          .finally(() => { isRefreshing = false; });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
