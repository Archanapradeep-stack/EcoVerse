"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { UserButton, useAuth } from "@clerk/nextjs";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Games", href: "/games" },
  { name: "Challenges", href: "/challenges" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Teacher", href: "/teacher" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const { userId } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-primary/20 p-2 rounded-2xl">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-foreground">EcoVerse</span>
        </Link>
        <nav className="hidden lg:flex items-center space-x-8 text-sm font-bold text-text-secondary">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 py-1"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          {!userId ? (
            <>
              <Link href="/sign-in" className="hidden sm:inline-flex font-bold hover:text-primary transition-colors px-4">
                Login
              </Link>
              <Link href="/sign-up" className={buttonVariants({ className: "hidden sm:inline-flex rounded-2xl font-bold shadow-md shadow-primary/20 px-6" })}>
                Play Now
              </Link>
            </>
          ) : (
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 border-2 border-primary/20 hover:border-primary transition-colors",
                  userButtonPopoverCard: "rounded-2xl shadow-xl border-border/50",
                }
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}
