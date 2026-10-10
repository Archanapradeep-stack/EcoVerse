"use client"

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
      } else {
        const role = (user.unsafeMetadata?.role as string) || (user.publicMetadata?.role as string);
        if (!role) {
          router.push('/onboarding');
        } else {
          router.push(`/dashboard/${role.toLowerCase()}`);
        }
      }
    }
  }, [isLoaded, user, router]);

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-secondary font-bold">Loading your dashboard...</p>
      </div>
    </div>
  );
}
