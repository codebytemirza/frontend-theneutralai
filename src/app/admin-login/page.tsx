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
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { Shield } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
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

    const adminToken = localStorage.getItem("adminToken");
    
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
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast({
          title: "Success",
          description: data.message || "Admin login successful!",
        });

        // ✅ Store admin_token from backend
        if (data.data?.admin_token) {
          localStorage.setItem("adminToken", data.data.admin_token);
          localStorage.setItem("adminEmail", email);
          localStorage.setItem("adminRole", data.data.role);
          localStorage.removeItem("userToken");
          localStorage.removeItem("userEmail");
        }

        // ✅ Use replace instead of push
        router.replace("/admin/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: data.message || "Invalid administrator credentials.",
        });
      }
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline mt-2">
            Admin Access
          </CardTitle>
          <CardDescription>
            Please enter your administrator credentials.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Return to Home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}