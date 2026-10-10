import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CoursesUI from "@/components/learning/CoursesUI";
import { getOrCreateDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getOrCreateDbUser(clerkUser);

  if (!dbUser || !dbUser.profile) {
    redirect("/"); 
  }

  let courses: any[] = [];
  try {
    courses = await prisma.course.findMany({
      orderBy: { createdAt: 'asc' }
    });
  } catch (error) {
    console.error("Failed to fetch courses:", error);
  }

  return (
    <CoursesUI 
      profile={dbUser.profile} 
      firstName={clerkUser.firstName} 
      fullName={dbUser.name || clerkUser.fullName}
      imageUrl={dbUser.profilePicture || clerkUser.imageUrl}
      role={dbUser.role}
      courses={courses}
    />
  );
}
