"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

export type UserRole = "owner" | "trainer" | "member";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gymName: string | null;
  roles: UserRole[];
  onboardingComplete: boolean;
}

export interface RegistrationInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginAs: (email: string, password: string) => Promise<void>;
  register: (input: RegistrationInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Restore the server-managed session from the HTTP-only cookie.
  const loadUserFromToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData: AuthUser = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadUserFromToken();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadUserFromToken]);

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
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detail = Array.isArray(errorData.detail)
          ? errorData.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(" ")
          : errorData.detail;
        throw new Error(detail || "Authentication failed. Check your email and password.");
      }

      const data = await response.json();

      const authenticatedUser = data.user as AuthUser;
      setUser(authenticatedUser);
      router.push(authenticatedUser.onboardingComplete ? workspacePath(authenticatedUser.role) : "/onboarding");
    } catch (error) {
      throw error instanceof Error ? error : new Error("Failed to connect to backend API");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (input: RegistrationInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = Array.isArray(data.detail)
          ? data.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(" ")
          : data.detail;
        throw new Error(detail || "Could not create your account. Please try again.");
      }
      const registeredUser = data.user as AuthUser;
      setUser(registeredUser);
      router.push("/onboarding");
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
    } catch {
      // Clear local UI state even if the network is unavailable.
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAs, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function workspacePath(role: UserRole): string {
  if (role === "owner") return "/owner";
  if (role === "trainer") return "/trainer";
  return "/dashboard";
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
