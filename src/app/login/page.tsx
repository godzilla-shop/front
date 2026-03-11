"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";
import {
    Mail,
    Lock,
    ArrowRight,
    MessageSquare,
    ShieldCheck,
    AlertCircle,
    Loader2
} from "lucide-react";

export default function LoginPage() {
    const { t, locale, setLocale } = useLang();
    const L = t.login;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "/";
        } catch (err: any) {
            setError(L.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center p-6 z-[100]" style={{ background: 'hsl(240 10% 3.9%)' }}>
            {/* Ambient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" style={{ background: 'rgba(5,150,105,0.08)', filter: 'blur(100px)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full" style={{ background: 'rgba(16,185,129,0.04)', filter: 'blur(100px)' }} />

            {/* Language switcher */}
            <div className="absolute top-6 right-6 flex gap-2">
                {(['it', 'es'] as const).map((l) => (
                    <button
                        key={l}
                        onClick={() => setLocale(l)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${locale === l
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                            }`}
                        style={{ color: locale === l ? '#fff' : '#94a3b8' }}
                    >
                        {translations[l].flag} {translations[l].name}
                    </button>
                ))}
            </div>

            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center space-y-4">
                    <div
                        className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto"
                        style={{
                            background: '#059669',
                            boxShadow: '0 20px 40px -12px rgba(16,185,129,0.3)',
                            transform: 'rotate(12deg)',
                            transition: 'transform 0.5s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(0deg)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(12deg)')}
                    >
                        <MessageSquare style={{ color: '#fff', width: 40, height: 40 }} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight" style={{ color: '#f8fafc' }}>
                            Godzilla<span style={{ color: '#10b981' }}>Shop</span>
                        </h1>
                        <p style={{ color: '#64748b', fontWeight: 500 }}>{L.subtitle}</p>
                    </div>
                </div>

                {/* Card */}
                <div className="glass rounded-3xl p-10 space-y-6">
                    <div className="flex items-center gap-3">
                        <ShieldCheck style={{ color: '#10b981', width: 24, height: 24 }} />
                        <h2 className="text-xl font-bold" style={{ color: '#f8fafc' }}>{L.title}</h2>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>
                                {L.email}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#64748b' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={L.emailPlaceholder}
                                    className="w-full rounded-2xl py-4 pl-12 pr-4 font-medium focus:outline-none transition-all"
                                    style={{
                                        background: 'rgba(15,23,42,0.6)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#f8fafc',
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>
                                {L.password}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#64748b' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={L.passwordPlaceholder}
                                    className="w-full rounded-2xl py-4 pl-12 pr-4 font-medium focus:outline-none transition-all"
                                    style={{
                                        background: 'rgba(15,23,42,0.6)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#f8fafc',
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 rounded-2xl text-sm font-semibold"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
                            style={{ opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {L.loading}
                                </>
                            ) : (
                                <>
                                    {L.submit}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs uppercase tracking-widest" style={{ color: '#334155' }}>
                    {L.footer}
                </p>
            </div>
        </div>
    );
}
