// AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { tryRefresh, login as authLogin, logoutLocal, logoutServer } from '@/services/auth';
import { setAccessToken } from '@/services/api';
import api from '@/services/api';

// Define Member type based on your backend MemberDto and JWT payload
export type Member = {
  id: number;
  name: string;
  type: "MEMBER" | "MANAGER" | "ADMIN";
  worksAt?: number;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  department?: string;
  position?: string;
  salary?: number;
  hireDate?: string;
  fname?: string;
  mname?: string;
  lname?: string;
  gender?: string;
  role?: string;
  allowedPaidLeaves?: number;
  allowedHours?: number;
  feasibleRoles?: number[];
};


// Define the shape of the context
type AuthContextType = {
  accessToken: string | null;
  user: Member | null;
  isLoading: boolean;
  login: (id: number, password: string) => Promise<Member | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

// Create context with a properly typed default object
const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  user: null,
  isLoading: true,
  login: async (_id: number, _password: string): Promise<Member | null> => {
    /* noop default */
    return null;
  },
  logout: (): void => {
    /* noop default */
  },
  refreshUser: async (): Promise<void> => {
    /* noop default */
  },
});


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user information from /auth/me endpoint
  const fetchUser = async (): Promise<Member | null> => {
    try {
      console.log('AuthContext: Fetching user from /auth/me');
      const response = await api.get('/auth/me');
      console.log('AuthContext: User response:', response.data);
      setUser(response.data);
      return response.data as Member;
    } catch (error) {
      console.error('AuthContext: Failed to fetch user:', error);
      setUser(null);
      return null;
    }
  };

  // Try to refresh token on mount
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const token = await tryRefresh();
      setToken(token ?? null);
      setAccessToken(token ?? null);
      
      if (token) {
        await fetchUser();
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (id: number, password: string) => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Starting login for ID:', id);
      const token = await authLogin(id, password);
      console.log('AuthContext: Received token:', token ? 'Yes' : 'No');
      console.log('AuthContext: Token value:', token);
      setToken(token ?? null);
      setAccessToken(token ?? null);
      
      // Fetch user data after successful login and return it
      if (token) {
        const userData = await fetchUser();
        console.log('AuthContext: Fetched user data:', userData);
        return userData;
      } else {
        console.error('AuthContext: No token received, cannot fetch user data');
        return null;
      }
    } catch (error) {
      console.error('AuthContext: Login error caught:', error);
      throw error; // Re-throw so the component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('AuthContext: Logging out user');
    try {
      // Call backend to clear the refresh token cookie
      console.log('AuthContext: Calling backend /auth/logout to clear refresh token cookie');
      await logoutServer();
      console.log('AuthContext: Backend logout successful, refresh token cookie cleared');
    } catch (error) {
      console.error('AuthContext: Backend logout failed, but clearing local state anyway:', error);
      // Even if backend call fails, clear local state
      logoutLocal();
    }
    
    // Clear all local auth state
    setToken(null);
    setAccessToken(null);
    setUser(null);
    console.log('AuthContext: User logged out, all tokens and state cleared');
    
    // Redirect to login page
    window.location.href = '/auth';
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
