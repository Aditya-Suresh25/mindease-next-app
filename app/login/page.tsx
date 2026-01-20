"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/api/auth";
import { signIn, useSession as useNextAuthSession } from "next-auth/react";
import { useEffect } from "react";
import { useSession } from "@/lib/contexts/session-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Mail,
  Sparkles,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { checkSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useNextAuthSession();

  // Sync NextAuth session to localStorage for compatibility with existing API calls
  useEffect(() => {
    if (session && (session as any).accessToken) {
      localStorage.setItem("token", (session as any).accessToken);
      // Wait a tick then update global session state
      setTimeout(() => {
        checkSession();
        router.push("/dashboard");
      }, 100);
    }
  }, [session, router, checkSession]);

  const handleGoogleLogin = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginUser(email, password);

      // Store the token in localStorage
      localStorage.setItem("token", response.token);

      // Update session state
      await checkSession();

      // Wait for state to update before redirecting
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden p-4">

      {/* 1. Ambient Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      {/* 2. Main Card Container */}
      <div className="w-full max-w-lg z-10">
        <div className="bg-card/70 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative group">

          {/* Subtle top shimmer */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />

          {/* Header Section */}
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner shadow-primary/5 ring-1 ring-primary/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Back</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xs mx-auto">
              Continue your journey to mindfulness.
            </p>
          </div>

          {/* Form Section */}
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Email Input */}
            <div className="space-y-1.5">
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 group-focus-within/input:text-primary transition-colors duration-300" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  className="pl-12 h-12 rounded-xl bg-background/50 border-input hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 group-focus-within/input:text-primary transition-colors duration-300" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="pl-12 pr-12 h-12 rounded-xl bg-background/50 border-input hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground/50 hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex justify-end px-1">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 mt-2"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground/50 font-medium">Original Choice</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-border/50 hover:bg-muted/50 hover:text-primary transition-all duration-300 gap-3"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24"><path d="M12.0003 20.45c-4.6667 0-8.4501-3.7834-8.4501-8.45 0-4.6667 3.7834-8.45 8.4501-8.45 2.2833 0 4.3833.8167 6.0167 2.3 l-2.3 2.3c-.9334-.9-2.2-1.4667-3.7167-1.4667-3.2166 0-5.8333 2.6167-5.8333 5.8334 0 3.2166 2.6167 5.8333 5.8333 5.8333 2.9667 0 5.15-2.0333 5.3-4.8333h-5.3v-3.4167h8.8334c.15.5834.25 1.1834.25 1.8334 0 5.25-3.5167 8.9833-9.0834 8.9166Z" fill="currentColor" /></svg>
            Sign in with Google
          </Button>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-semibold hover:text-primary/80 hover:underline underline-offset-4 transition-all"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}