"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileUp,
    Settings,
    LogOut,
    MessageSquare,
    Activity
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Sidebar() {
    const pathname = usePathname();
    const { t, locale, setLocale } = useLang();
    const N = t.nav;

    const menuItems = [
        { name: N.dashboard, href: "/", icon: LayoutDashboard },
        { name: N.contacts, href: "/contacts", icon: Users },
        { name: N.import, href: "/import", icon: FileUp },
        { name: N.history, href: "/history", icon: Activity },
        { name: N.config, href: "/config", icon: Settings },
    ];

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = "/login";
    };

    return (
        <aside style={{
            width: '280px',
            background: 'hsl(240 10% 6%)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            gap: '2rem',
            zIndex: 50,
        }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
                <div style={{
                    width: 40, height: 40,
                    background: '#059669',
                    borderRadius: '0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(16,185,129,0.3)'
                }}>
                    <MessageSquare style={{ color: '#fff', width: 22, height: 22 }} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                        Godzilla<span style={{ color: '#10b981' }}>Shop</span>
                    </h1>
                    <p style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                        {N.subtitle}
                    </p>
                </div>
            </div>

            {/* Language switcher */}
            <div style={{ display: 'flex', gap: '0.5rem', padding: '0 0.25rem' }}>
                {(['it', 'es'] as const).map((l) => (
                    <button
                        key={l}
                        onClick={() => setLocale(l)}
                        style={{
                            flex: 1,
                            padding: '0.4rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: 'none',
                            background: locale === l ? '#059669' : 'rgba(255,255,255,0.05)',
                            color: locale === l ? '#fff' : '#64748b',
                            transition: 'all 0.2s',
                        }}
                    >
                        {translations[l].flag} {translations[l].name}
                    </button>
                ))}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                                background: isActive ? 'rgba(5,150,105,0.12)' : 'transparent',
                                color: isActive ? '#10b981' : '#64748b',
                                border: isActive ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                                textDecoration: 'none',
                            }}
                        >
                            <item.icon style={{ width: 20, height: 20 }} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        width: '100%',
                        cursor: 'pointer',
                        background: 'transparent',
                        border: 'none',
                        color: '#f87171',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    <LogOut style={{ width: 20, height: 20 }} />
                    {N.logout}
                </button>
            </div>
        </aside>
    );
}
