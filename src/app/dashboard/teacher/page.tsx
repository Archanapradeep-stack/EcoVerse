"use client"

import { useUser } from "@clerk/nextjs";
import { Users, LineChart, FileText, Settings } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div className="bg-accent/10 p-8 rounded-3xl border border-accent/20">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Educator Dashboard
        </h1>
        <p className="text-text-secondary font-medium mt-2">
          Welcome back, {user?.firstName || "Teacher"}. Monitor your class progress here.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Total Students", value: "34", icon: Users, color: "text-blue-500" },
          { name: "Avg. Completion", value: "78%", icon: LineChart, color: "text-primary" },
          { name: "Assignments Due", value: "2", icon: FileText, color: "text-orange-500" },
          { name: "Needs Review", value: "5", icon: Settings, color: "text-destructive" },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-3xl p-6 border-2 border-border shadow-sm flex flex-col items-center justify-center text-center">
            <div className={`mb-3 bg-muted p-3 rounded-2xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">{stat.name}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-card rounded-3xl p-6 border-2 border-border shadow-sm h-96 flex items-center justify-center text-text-secondary/50 font-bold">
        Class Performance Chart Placeholder
      </div>
    </div>
  );
}
