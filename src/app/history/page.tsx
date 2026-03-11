"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { apiFetch } from "@/lib/apiFetch";

export default function HistoryPage() {
    const { t } = useLang();
    const H = t.history;

    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch(`/contacts`)
            .then((r) => r.json())
            .then((data) => {
                const attempted = Array.isArray(data)
                    ? data.filter((c) => c.messageSent || (c.attempts && c.attempts > 0))
                    : [];
                setContacts(attempted);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const fmtDate = (raw: any) => {
        if (!raw) return "—";
        const ms = raw._seconds ? raw._seconds * 1000 : new Date(raw).getTime();
        return new Date(ms).toLocaleString(t.locale === "it" ? "it-IT" : "es-CO", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const statusCfg = (c: any) => {
        if (c.messageSent) return { label: H.sent, icon: CheckCircle2, style: { color: "#10b981", background: "rgba(16,185,129,0.1)" } };
        if (c.attempts > 0) return { label: H.failed, icon: XCircle, style: { color: "#f87171", background: "rgba(239,68,68,0.1)" } };
        return { label: H.pending, icon: Clock, style: { color: "#f59e0b", background: "rgba(245,158,11,0.1)" } };
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <header style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 48, height: 48, background: "rgba(16,185,129,0.1)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Activity style={{ width: 24, height: 24, color: "#10b981" }} />
                </div>
                <div>
                    <h2 style={{ fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{H.title}</h2>
                    <p style={{ color: "#64748b", marginTop: "0.25rem" }}>{contacts.length} {H.subtitle}</p>
                </div>
            </header>

            <div className="glass" style={{ borderRadius: "2rem", overflow: "hidden" }}>
                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem", gap: "0.75rem", color: "#10b981" }}>
                        <Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite" }} />
                        <span style={{ fontWeight: 600 }}>{H.loading}</span>
                    </div>
                ) : contacts.length === 0 ? (
                    <div style={{ padding: "5rem", textAlign: "center", color: "#64748b", fontWeight: 500 }}>{H.empty}</div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                {[H.contact, H.phone, H.status, H.date].map((h) => (
                                    <th key={h} style={{ padding: "1.25rem 2rem", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#475569" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((item) => {
                                const cfg = statusCfg(item);
                                const Icon = cfg.icon;
                                return (
                                    <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                        <td style={{ padding: "1.25rem 2rem", fontWeight: 600 }}>{item.name || "—"}</td>
                                        <td style={{ padding: "1.25rem 2rem", color: "#64748b" }}>{item.phone}</td>
                                        <td style={{ padding: "1.25rem 2rem" }}>
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", ...cfg.style }}>
                                                <Icon style={{ width: 12, height: 12 }} />{cfg.label}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.25rem 2rem", color: "#64748b", fontSize: "0.875rem" }}>{fmtDate(item.updatedAt || item.createdAt)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
