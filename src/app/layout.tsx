import type { Metadata } from "next";
import "./globals.css";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Credora",
  description: "Personal credit card spending and rewards dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Sidebar />

        <div className="app-shell">
          <Header />

          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}