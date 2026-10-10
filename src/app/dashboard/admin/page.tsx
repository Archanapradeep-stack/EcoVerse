"use client"

import { useUser } from "@clerk/nextjs";
import { ShieldCheck, Users, Database, Settings } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div className="bg-destructive/10 p-8 rounded-3xl border border-destructive/20 flex items-center gap-4">
        <ShieldCheck className="text-destructive h-16 w-16" />
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            System Administration
          </h1>
          <p className="text-text-secondary font-medium mt-2">
            Welcome, Administrator {user?.firstName}. You have full access to platform controls.
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "Manage Users", desc: "View and edit all users", icon: Users, color: "text-blue-500" },
          { name: "Platform Settings", desc: "Configure global variables", icon: Settings, color: "text-gray-500" },
          { name: "Database Health", desc: "View connection status", icon: Database, color: "text-emerald-500" },
        ].map((item, i) => (
          <div key={i} className="bg-card rounded-3xl p-6 border-2 border-border shadow-sm flex items-start gap-4 hover:border-destructive/50 transition-colors cursor-pointer">
            <div className={`bg-muted p-4 rounded-2xl ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-sm text-text-secondary">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
