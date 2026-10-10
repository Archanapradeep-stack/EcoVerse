import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm",
              card: "bg-card shadow-xl border-2 border-border/50 rounded-3xl",
              headerTitle: "text-2xl font-black text-foreground",
              headerSubtitle: "text-text-secondary font-medium",
            }
          }}
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
