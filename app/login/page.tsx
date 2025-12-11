'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";
import { Container } from "@/components/ui/container";

export default function LoginPage(){

    // Assuming you would use state for loading and error, and the form data
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // You'd typically add more state here for form inputs (email, password)

    // The logic inside the form needs to be wrapped in a function,
    // but for fixing unclosed tags, we'll focus on the JSX structure.

    return(
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/30">
            <Container className="flex flex-col items-center justify-center w-full">
            <Card className="w-full md:w-5/12 max-w-2xl p-8 md:p-10 rounded-3xl shadow-2xl border border-primary/10 bg-card/90 backdrop-blur-lg mt-12">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-1 tracking-tight">
              Sign In
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Welcome back! Please sign in to continue your journey.
            </p>
          </div>

            {/* form component */}
            <form className="space-y-6">
                <div>
                    <label
                    htmlFor="email"
                    className="block text-base font-semibold mb-1"
                >
                    Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-12 py-2 text-base rounded-xl bg-card bg-opacity-80 border border-primary focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-muted-foreground"


                      required
                    />
                </div>
                </div> {/* Closing div for the email field group */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-base font-semibold mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-12 py-2 text-base rounded-xl bg-card bg-opacity-80 border border-primary focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-muted-foreground"

                    />
                  </div>
                </div> {/* Closing div for the password field group */}

                {/* The original code had the error block and the button *inside* the outer div, but *outside* the form. */}
                {/* The form was closed early, and the button was missing the 'form' context */}
                {/* I have moved the form closing tag to the end, and included the button and error block inside the form.
                    I also added the missing closing </div> for the outer email field group, and made sure all the form fields are in a logical structure.
                    The button 'type="submit"' belongs inside the form. */}

            {error && (
              <p className="text-red-500 text-base text-center font-medium">
                {error}
              </p>
            )}
            <Button
              className="w-full py-2 text-base rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-md hover:from-primary/80 hover:to-primary"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form> {/* Fixed: Closing form tag */}

          <div className="my-6 border-t border-primary/10" />
          {/* Fixed: Replaced < with <div className="flex flex-col items-center gap-2"> */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?
              </span>
              <Link
                href="/signup"
                className="text-primary font-semibold underline hover:text-primary/80 transition-colors"
              >
                Sign up
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link
                href="/forgot-password"
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}