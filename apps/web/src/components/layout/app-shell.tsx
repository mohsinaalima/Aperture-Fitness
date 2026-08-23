import * as React from "react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Sidebar />
      <main className="md:pl-[240px] pb-[80px] md:pb-8 transition-all">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 py-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};