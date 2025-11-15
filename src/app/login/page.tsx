"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // ✅ Use ref to prevent multiple auth checks
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // ✅ Only check once
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const userToken = localStorage.getItem("userToken");
    const adminToken = localStorage.getItem("adminToken");

    if (userToken) {
      router.replace("/chat");
      return;
    }

    if (adminToken) {
      router.replace("/admin/dashboard");
      return;
    }

    setIsCheckingAuth(false);
  }, []); // ✅ Empty dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter both email and password.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, try to login as regular user
      let response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      let data = await response.json();

      // If regular login succeeds
      if (response.ok && data.status === "success") {
        toast({
          title: "Success",
          description: data.message || "Login successful!",
        });

        // Store token if provided
        if (data.data?.token) {
          localStorage.setItem("userToken", data.data.token);
          localStorage.setItem("userEmail", email);
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminEmail");
        }

        // ✅ Use replace instead of push
        router.replace("/chat");
        return;
      }

      // If regular login fails, try admin login
      if (!response.ok || data.status !== "success") {
        response = await fetch(`${API_BASE_URL}/admin/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            password,
          }),
        });

        data = await response.json();

        if (response.ok && data.status === "success") {
          // Admin login successful
          toast({
            title: "Success",
            description: "Admin login successful!",
          });

          // ✅ Store admin_token (check your backend response)
          if (data.data?.admin_token) {
            localStorage.setItem("adminToken", data.data.admin_token);
            localStorage.setItem("adminEmail", email);
            localStorage.removeItem("userToken");
            localStorage.removeItem("userEmail");
          }

          // ✅ Use replace instead of push
          router.replace("/admin/dashboard");
          return;
        }
      }

      // If both logins failed
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: data.message || "Invalid email or password.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
          <CardDescription>
            Log in to continue your neutral conversations.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/reset-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}