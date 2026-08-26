"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, AuthUser> = {
  owner: {
    id: "usr-owner-01",
    name: "Marcus Aurelius",
    email: "owner@aperture.fit",
    role: "owner",
    gymName: "Aperture Iron Vault • Central",
  },
  trainer: {
    id: "usr-trainer-01",
    name: "Elena Rostova",
    email: "trainer@aperture.fit",
    role: "trainer",
    gymName: "Aperture Iron Vault • Central",
  },
  member: {
    id: "usr-member-01",
    name: "Alex Foster",
    email: "athlete@aperture.fit",
    role: "member",
    gymName: "Aperture Iron Vault • Central",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem("aperture_role") as UserRole | null;
    if (savedRole && DEMO_USERS[savedRole]) {
      setUser(DEMO_USERS[savedRole]);
    } else {
      setUser(DEMO_USERS.member);
    }
  }, []);

  const loginAs = (role: UserRole) => {
    const selectedUser = DEMO_USERS[role];
    setUser(selectedUser);
    localStorage.setItem("aperture_role", role);

    // Strict Role-Based Navigation Routing
    if (role === "owner") {
      router.push("/owner");
    } else if (role === "trainer") {
      router.push("/trainer");
    } else {
      router.push("/dashboard");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("aperture_role");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loginAs, logout }}>
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
