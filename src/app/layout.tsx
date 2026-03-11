import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { LangProvider } from "@/context/LangContext";
import AuthGuard from "@/components/AuthGuard";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Godzilla Shop | WhatsApp Automation",
  description: "Sistema di messaggistica automatizzata per Godzilla Shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={outfit.className}
        style={{
          background: "hsl(240 10% 3.9%)",
          color: "hsl(0 0% 98%)",
          display: "flex",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        <LangProvider>
          <AuthGuard>
            <Sidebar />
            <main
              style={{
                flex: 1,
                overflowY: "auto",
                background:
                  "radial-gradient(ellipse at top right, rgba(5,150,105,0.06) 0%, hsl(240 10% 3.9%) 60%)",
              }}
            >
              <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem" }}>
                {children}
              </div>
            </main>
          </AuthGuard>
        </LangProvider>
      </body>
    </html>
  );
}
