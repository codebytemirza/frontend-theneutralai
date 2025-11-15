"use client";

import { ADMIN_EMAIL, ADMIN_PASSWORD } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import React, { createContext, useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
  type: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  adminLogin: (email: string, pass: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("neutral-chat-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("neutral-chat-user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string) => {
    const newUser: User = { name: "Test User", email, type: "user" };
    localStorage.setItem("neutral-chat-user", JSON.stringify(newUser));
    setUser(newUser);
    router.push("/chat");
  };

  const signup = (name: string, email: string) => {
    const newUser: User = { name, email, type: "user" };
    localStorage.setItem("neutral-chat-user", JSON.stringify(newUser));
    setUser(newUser);
    router.push("/chat");
  };

  const adminLogin = (email: string, pass: string) => {
    if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
      const adminUser: User = { name: "Admin", email, type: "admin" };
      localStorage.setItem("neutral-chat-user", JSON.stringify(adminUser));
      setUser(adminUser);
      router.push("/admin/dashboard");
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("neutral-chat-user");
    setUser(null);
    router.push("/login");
  };
  
  const isAuthenticated = !isLoading && user !== null;
  const isAdmin = !isLoading && user?.type === 'admin';

  const value = {
    user,
    login,
    signup,
    adminLogin,
    logout,
    isAuthenticated,
    isAdmin,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
