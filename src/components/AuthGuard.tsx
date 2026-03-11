"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/login"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<"loading" | "auth" | "unauth">("loading");
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setStatus("auth");
                // If logged-in user visits /login, redirect to dashboard
                if (pathname === "/login") {
                    router.replace("/");
                }
            } else {
                setStatus("unauth");
                if (!PUBLIC_ROUTES.includes(pathname)) {
                    router.replace("/login");
                }
            }
        });
        return () => unsubscribe();
    }, [pathname, router]);

    // Still checking auth state
    if (status === "loading") {
        return (
            <div style={{
                position: "fixed", inset: 0,
                background: "hsl(240 10% 3.9%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: "1rem",
            }}>
                <Loader2 style={{ width: 40, height: 40, color: "#10b981", animation: "spin 1s linear infinite" }} />
                <p style={{ color: "#475569", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                    Caricamento...
                </p>
            </div>
        );
    }

    // On a public route (login) — always render
    if (PUBLIC_ROUTES.includes(pathname)) {
        return <>{children}</>;
    }

    // Protected route — only render if authenticated
    if (status === "auth") {
        return <>{children}</>;
    }

    // Redirecting — show nothing
    return null;
}
