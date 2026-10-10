import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardUI from "@/components/dashboard/DashboardUI";
import { getOrCreateDbUser } from "@/lib/user";

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getOrCreateDbUser(clerkUser);

  if (!dbUser || !dbUser.profile) {
    throw new Error("Failed to load user profile");
  }

  return (
    <DashboardUI 
      profile={dbUser.profile} 
      firstName={clerkUser.firstName} 
      fullName={dbUser.name || clerkUser.fullName}
      imageUrl={dbUser.profilePicture || clerkUser.imageUrl}
      role={dbUser.role}
    />
  );
}
