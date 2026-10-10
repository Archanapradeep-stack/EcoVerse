import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { getOrCreateDbUser } from "@/lib/user";
import GameClient from "./GameClient";

export default async function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getOrCreateDbUser(clerkUser);

  if (!dbUser || !dbUser.profile) {
    redirect("/"); 
  }

  const { gameId } = await params;

  return (
    <AppLayout 
      profile={dbUser.profile} 
      firstName={clerkUser.firstName} 
      fullName={dbUser.name || clerkUser.fullName}
      imageUrl={dbUser.profilePicture || clerkUser.imageUrl}
      role={dbUser.role}
      activePath="/games"
    >
      <div className="absolute inset-0 bg-[#F4F9F4] z-0" />
      <div className="relative z-10 p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <GameClient gameId={gameId} />
      </div>
    </AppLayout>
  );
}
