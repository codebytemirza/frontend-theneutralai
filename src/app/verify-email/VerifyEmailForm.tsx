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
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const email = searchParams?.get("email") || "";

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email not found. Please register again.",
      });
      router.push("/signup");
      return;
    }

    if (!code || code.length !== 6) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter the 6-digit verification code.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast({
          title: "Success",
          description: "Email verified successfully! Redirecting to login...",
        });

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: data.message || "Invalid or expired verification code.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during verification.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email not found.",
      });
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast({
          title: "Success",
          description: "Verification code resent to your email. Check your inbox.",
        });
        // Start 60-second countdown before allowing another resend
        setResendCountdown(60);
        // Clear the code input
        setCode("");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to resend code.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Verify Email</CardTitle>
        <CardDescription>
          Enter the verification code sent to your email
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isLoading || isResending}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Check your email (including spam folder) for the 6-digit code
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isResending || code.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResendCode}
            disabled={isResending || isLoading || resendCountdown > 0}
          >
            {resendCountdown > 0
              ? `Resend Code (${resendCountdown}s)`
              : isResending
              ? "Sending..."
              : "Resend Code"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Wrong email?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up again
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}