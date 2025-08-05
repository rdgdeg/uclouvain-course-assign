import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  showAdminButton?: boolean;
}

export const Layout = ({ children, showAdminButton = true }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showAdminButton={showAdminButton} />
      <main className="flex-1 pt-20 pb-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};