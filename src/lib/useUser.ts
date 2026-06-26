"use client";

import { useEffect, useState, useCallback } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  factoryId?: string;
  isGuest?: boolean;
}

export interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  }, []);

  return {
    user,
    isLoading,
    isSignedIn: !!user,
    logout,
    refetch,
  };
}
