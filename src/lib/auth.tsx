"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import * as api from "./api";

interface AuthState {
  user: api.PrivateUser | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  loginWithApple: (identityToken: string, user?: { firstName?: string; lastName?: string; email?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY   = "kirky_at";
const REFRESH_KEY = "kirky_rt";

function persist(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

function clear() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  const loadUser = useCallback(async () => {
    const at = localStorage.getItem(TOKEN_KEY);
    const rt = localStorage.getItem(REFRESH_KEY);
    if (!at || !rt) {
      setState({ user: null, loading: false });
      return;
    }
    api.setTokens(at, rt);
    try {
      const { user } = await api.getMe();
      setState({ user, loading: false });
    } catch {
      api.clearTokens();
      clear();
      setState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login({ email, password });
    api.setTokens(result.accessToken, result.refreshToken);
    persist(result.accessToken, result.refreshToken);
    const { user } = await api.getMe();
    setState({ user, loading: false });
  }, []);

  const signup = useCallback(async (email: string, password: string, username: string) => {
    const result = await api.signup({ email, password, username });
    if (result.accessToken) {
      api.setTokens(result.accessToken, result.refreshToken);
      persist(result.accessToken, result.refreshToken);
      const { user } = await api.getMe();
      setState({ user, loading: false });
    }
  }, []);

  const loginWithApple = useCallback(async (
    identityToken: string,
    user?: { firstName?: string; lastName?: string; email?: string }
  ) => {
    const result = await api.loginWithApple({ identityToken, user });
    api.setTokens(result.accessToken, result.refreshToken);
    persist(result.accessToken, result.refreshToken);
    const { user: me } = await api.getMe();
    setState({ user: me, loading: false });
  }, []);

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    api.clearTokens();
    clear();
    setState({ user: null, loading: false });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api.getMe();
      setState((s) => ({ ...s, user }));
    } catch {
      /* silent */
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, loginWithApple, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
