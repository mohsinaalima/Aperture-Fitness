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
  gymName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginAs: (role: UserRole, customPassword?: string) => Promise<void>;
  logout: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Fallback email map matching backend demo accounts
const ROLE_CREDENTIALS: Record<
  UserRole,
  { email: string; defaultPass: string }
> = {
  owner: { email: "owner@aperture.fit", defaultPass: "Password123!" },
  trainer: { email: "trainer@aperture.fit", defaultPass: "Password123!" },
  member: { email: "athlete@aperture.fit", defaultPass: "Password123!" },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load session from backend using stored token or restore role
  const loadUserFromToken = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData: AuthUser = await response.json();
        setUser(userData);
        localStorage.setItem("aperture_role", userData.role);
      } else {
        // Token expired or invalid
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("aperture_role");
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user session from FastAPI:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  // Real backend login connected to FastAPI
  const loginAs = async (role: UserRole, customPassword?: string) => {
    setIsLoading(true);
    const credentials = ROLE_CREDENTIALS[role];
    const password = customPassword || credentials.defaultPass;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Authentication failed");
      }

      const data = await response.json();

      // Store real JWT tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("aperture_role", role);

      setUser(data.user);

      // Strict Role-Based Navigation Routing
      if (role === "owner") {
        router.push("/owner");
      } else if (role === "trainer") {
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
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.error("Failed to notify backend on logout:", err);
      }
    }

    // Clean client state
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("aperture_role");
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
