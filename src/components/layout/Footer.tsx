import Link from "next/link";
import { Leaf, MessageCircle, Share2, PlayCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-24">
      <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
        <div className="flex flex-col items-center md:items-start max-w-sm">
          <Link href="/" className="flex items-center space-x-2 mb-4">
            <div className="bg-primary/20 p-2 rounded-2xl">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-foreground">EcoVerse</span>
          </Link>
          <p className="text-muted-foreground text-center md:text-left font-medium">
            Transforming environmental education into an exciting adventure through Gamification and AI.
          </p>
        </div>
        
        <div className="flex gap-16 text-center md:text-left">
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg text-foreground">Platform</h4>
            <Link href="/about" className="font-medium text-muted-foreground hover:text-primary transition-colors">About Us</Link>
            <Link href="/contact" className="font-medium text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg text-foreground">Legal</h4>
            <Link href="/privacy" className="font-medium text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="font-medium text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-start gap-6">
          <h4 className="font-bold text-lg text-foreground">Join the Community</h4>
          <div className="flex space-x-4">
            <Link href="#" className="bg-muted p-3 rounded-2xl text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
              <Share2 className="h-5 w-5" />
            </Link>
            <Link href="#" className="bg-muted p-3 rounded-2xl text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
              <MessageCircle className="h-5 w-5" />
            </Link>
            <Link href="#" className="bg-muted p-3 rounded-2xl text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
              <PlayCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 py-8 text-center bg-muted/30">
        <p className="font-medium text-muted-foreground">
          &copy; {new Date().getFullYear()} EcoVerse. All rights reserved. Play. Learn. Protect.
        </p>
      </div>
    </footer>
  );
}
