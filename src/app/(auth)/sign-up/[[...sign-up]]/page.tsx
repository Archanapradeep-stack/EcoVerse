import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm",
              card: "bg-card shadow-xl border-2 border-border/50 rounded-3xl",
              headerTitle: "text-2xl font-black text-foreground",
              headerSubtitle: "text-text-secondary font-medium",
            }
          }}
          signInUrl="/sign-in"
          fallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}
