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
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ResetStep = "request" | "reset";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState<ResetStep>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter your email address.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/reset-password-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast({
          title: "Success",
          description:
            "Reset code sent to your email. Check your inbox for the code.",
        });
        setStep("reset");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to send reset code.",
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
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Passwords do not match.",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast({
          title: "Success",
          description: "Password reset successfully! Redirecting to login...",
        });

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Reset Failed",
          description: data.message || "Failed to reset password.",
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
      setIsLoading(false);
    }
  };

  const handleBackToRequest = () => {
    setStep("request");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">
          Reset Password
        </CardTitle>
        <CardDescription>
          {step === "request"
            ? "Enter your email to receive a reset code"
            : "Enter the code and your new password"}
        </CardDescription>
      </CardHeader>

      {step === "request" ? (
        <form onSubmit={handleRequestReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                We'll send a reset code to this email address
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-display">Email Address</Label>
              <Input
                id="email-display"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Reset Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isLoading}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Check your email for the reset code
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBackToRequest}
              disabled={isLoading}
            >
              Back to Email Entry
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}