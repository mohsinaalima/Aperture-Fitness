"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

export type UserRole = "owner" | "trainer" | "member";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gymName?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginAs: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const API_BASE_URL = "/api/backend";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Restore the server-managed session cookie.
  const loadUserFromSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const userData: AuthUser = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user session from FastAPI:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUserFromSession();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadUserFromSession]);

  // Real backend login connected to FastAPI
  const loginAs = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Authentication failed");
      }

      const data = await response.json();
      const authenticatedUser: AuthUser = data.user;
      setUser(authenticatedUser);

      // Strict Role-Based Navigation Routing
      if (authenticatedUser.role === "owner") {
        router.push("/owner");
      } else if (authenticatedUser.role === "trainer") {
        router.push("/trainer");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to connect to backend API",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to notify backend on logout:", err);
    }

    // Clean client state
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
