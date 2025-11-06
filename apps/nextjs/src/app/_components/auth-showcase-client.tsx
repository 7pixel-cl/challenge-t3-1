"use client";

import { useState } from "react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

import { authClient } from "~/auth/client";

interface AuthShowcaseClientProps {
  isAuthenticated: boolean;
  userName?: string;
  onSignOut: () => void;
}

export function AuthShowcaseClient({
  isAuthenticated,
  userName,
  onSignOut,
}: AuthShowcaseClientProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-center text-2xl">
          <span>Logged in as {userName}</span>
        </p>
        <Button size="lg" onClick={onSignOut}>
          Sign out
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });

        if (result.error) {
          setError(result.error.message ?? "Sign up failed");
          setLoading(false);
        } else {
          window.location.reload();
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });

        if (result.error) {
          setError(result.error.message ?? "Sign in failed");
          setLoading(false);
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      {isSignUp && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@example.com"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button size="lg" type="submit" disabled={loading}>
        {loading ? "Loading..." : isSignUp ? "Sign up" : "Sign in"}
      </Button>

      <Button
        size="sm"
        variant="ghost"
        type="button"
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError(null);
        }}
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Don't have an account? Sign up"}
      </Button>

      {!isSignUp && (
        <div className="space-y-2 rounded-md border p-3">
          <p className="text-center text-xs font-medium text-muted-foreground">
            Test Users (password: Test123.)
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              <span className="font-medium">Admin:</span> admin@example.com
            </p>
            <p>
              <span className="font-medium">Member 1:</span> member1@example.com
            </p>
            <p>
              <span className="font-medium">Member 2:</span> member2@example.com
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
