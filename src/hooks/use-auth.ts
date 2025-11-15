"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ Use ref to prevent multiple auth checks
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // ✅ Only check once
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const userToken = localStorage.getItem("userToken");
    const userEmail = localStorage.getItem("userEmail");

    if (userToken && userEmail) {
      setUser({ id: userEmail, email: userEmail });
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []); // ✅ Empty dependency array

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmail");
    setUser(null);
    setIsAuthenticated(false);
    router.replace("/login");
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
}