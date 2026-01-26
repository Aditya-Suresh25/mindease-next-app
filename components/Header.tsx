"use client";

import { useSession } from "@/lib/contexts/session-context";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  LogOut,
  Sparkles,
  MessageCircleHeart,
  Sun,
  Moon,
  Menu,
  X,
  History,
  FileText,
  BookOpen,
  Settings,
  Gamepad2,
  Heart
} from "lucide-react";
import { useEffect, useState } from "react";
import { ReviewPrompt } from "@/components/review/review-prompt";

export function Header() {
  const { user, loading, isAuthenticated, initiateLogout, completeLogout, showReviewPrompt } = useSession();
  const { setTheme, resolvedTheme } = useTheme(); // Use resolvedTheme for accurate toggle
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Nav links for landing page (unauthenticated users)
  const landingNavLinks = [
    { name: "Features", href: "/#features" },
    { name: "How it Works", href: "/#how-it-works" },
  ];

  // Nav links for authenticated users (mobile menu)
  const authenticatedNavLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Therapy", href: "/therapy/new", icon: MessageCircleHeart },
    { name: "Mood History", href: "/history", icon: History },
    { name: "Reflections", href: "/reflections", icon: FileText },
    { name: "Stories", href: "/stories", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/10 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => router.push(isAuthenticated ? "/dashboard" : "/")}
            className="group flex items-center gap-2 text-xl font-bold tracking-tighter text-primary transition-all active:scale-95"
          >
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MindEase
            </span>
          </button>

          {/* Desktop Navigation Links - Only show for unauthenticated users */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {landingNavLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-primary/5 hover:text-primary",
                    pathname === link.href ? "text-primary bg-primary/5" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Direct Theme Toggle Button */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-9 h-9 border border-primary/10 hover:bg-primary/5 relative overflow-hidden"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {!loading && (
            <>
              {isAuthenticated && user ? (
                <>
                  {/* Desktop User Dropdown - Hidden on Mobile */}
                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="relative group focus:outline-none ml-2">
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-10 group-hover:opacity-30 transition-opacity" />
                          <div className="relative flex items-center gap-2 p-0.5 pr-2 rounded-full bg-card border border-primary/10 hover:border-primary/30 transition-all">
                            <Image
                              src={user.avatar || "/placeholder-avatar.png"}
                              alt={user.name}
                              width={30}
                              height={30}
                              unoptimized
                              className="rounded-full object-cover border border-primary/10"
                            />
                            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-tighter px-1">
                              {user.name}
                            </span>
                          </div>
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-56 mt-2 p-2 bg-card/95 backdrop-blur-xl border-primary/10">
                        <DropdownMenuLabel className="p-2">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-bold leading-none">{user.name}</p>
                            <p className="text-[10px] leading-none text-muted-foreground uppercase tracking-widest">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-primary/10" />

                        <DropdownMenuItem onClick={() => router.push("/dashboard")} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg">
                          <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push("/settings")} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg">
                          <User className="w-4 h-4 text-primary" /> Profile Settings
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-primary/10" />

                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer p-2 rounded-lg text-red-500 focus:bg-red-500/10 focus:text-red-500" onClick={initiateLogout}>
                          <LogOut className="w-4 h-4" /> Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Mobile Hamburger Menu for Authenticated Users */}
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden rounded-full w-9 h-9 border border-primary/10 hover:bg-primary/5"
                      >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] p-0">
                      <div className="flex flex-col h-full">
                        {/* User Info Header */}
                        <div className="p-6 border-b border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
                          <div className="flex items-center gap-3">
                            <Image
                              src={user.avatar || "/placeholder-avatar.png"}
                              alt={user.name}
                              width={48}
                              height={48}
                              unoptimized
                              className="rounded-full object-cover border-2 border-primary/20"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-foreground truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                          {authenticatedNavLinks.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                            return (
                              <button
                                key={link.name}
                                onClick={() => {
                                  router.push(link.href);
                                  setMobileMenuOpen(false);
                                }}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                                  isActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                                )}
                              >
                                <link.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span>{link.name}</span>
                              </button>
                            );
                          })}
                        </nav>

                        {/* Logout Button */}
                        <div className="p-4 border-t border-primary/10">
                          <Button
                            variant="destructive"
                            className="w-full gap-2 rounded-xl"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              initiateLogout();
                            }}
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="rounded-full hidden sm:flex text-sm" onClick={() => router.push("/login")}>
                    Log in
                  </Button>
                  <Button className="rounded-full bg-primary hover:bg-primary/90 text-sm shadow-lg shadow-primary/10 transition-all active:scale-95" onClick={() => router.push("/signup")}>
                    Get Started
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Review Prompt Modal */}
      <ReviewPrompt 
        isOpen={showReviewPrompt} 
        onComplete={completeLogout} 
      />
    </nav>
  );
}