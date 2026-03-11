"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Clock, XCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { apiFetch } from "@/lib/apiFetch";

export default function HistoryPage() {
    const { t } = useLang();
    const H = t.history;
    const C = t.contacts;

    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 20;

    const fetchHistory = (page: number = 1) => {
        setLoading(true);
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            onlyHistory: 'true'
        });

        apiFetch(`/contacts?${params.toString()}`)
            .then((r) => r.json())
            .then((res) => {
                setContacts(Array.isArray(res.data) ? res.data : []);
                setTotalPages(res.totalPages || 1);
                setTotalItems(res.total || 0);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchHistory(currentPage);
    }, [currentPage]);

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
            <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 48, height: 48, background: "rgba(16,185,129,0.1)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Activity style={{ width: 24, height: 24, color: "#10b981" }} />
                </div>
                <div>
                    <h2 style={{ fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{H.title}</h2>
                    <p style={{ color: "#64748b", marginTop: "0.25rem" }}>{totalItems} {H.subtitle}</p>
                </div>
            </header>

            <div className="table-responsive" style={{ background: "rgba(15,23,42,0.3)", borderRadius: "2rem", overflowX: "auto" }}>
                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem", gap: "0.75rem", color: "#10b981" }}>
                        <Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite" }} />
                        <span style={{ fontWeight: 600 }}>{H.loading}</span>
                    </div>
                ) : contacts.length === 0 ? (
                    <div style={{ padding: "5rem", textAlign: "center", color: "#64748b", fontWeight: 500 }}>{H.empty}</div>
                ) : (
                    <>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    {[H.contact, H.phone, H.status, H.date].map((h) => (
                                        <th key={h} style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#475569" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.map((item) => {
                                    const cfg = statusCfg(item);
                                    const Icon = cfg.icon;
                                    return (
                                        <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                            <td style={{ padding: "1.25rem 1.5rem", fontWeight: 600 }}>{item.name || "—"}</td>
                                            <td style={{ padding: "1.25rem 1.5rem", color: "#64748b" }}>{item.phone}</td>
                                            <td style={{ padding: "1.25rem 1.5rem" }}>
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", ...cfg.style }}>
                                                    <Icon style={{ width: 12, height: 12 }} />{cfg.label}
                                                </div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1.5rem", color: "#64748b", fontSize: "0.875rem" }}>{fmtDate(item.updatedAt || item.createdAt)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
                                    {C.showing} <span style={{ color: "#f8fafc", fontWeight: 600 }}>{((currentPage - 1) * limit) + 1}</span> - <span style={{ color: "#f8fafc", fontWeight: 600 }}>{Math.min(currentPage * limit, totalItems)}</span> {C.of} <span style={{ color: "#f8fafc", fontWeight: 600 }}>{totalItems}</span> {C.total}
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        style={{ padding: "0.5rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.05)", border: "none", color: currentPage === 1 ? "#334155" : "#f8fafc", cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
                                    >
                                        <ChevronLeft style={{ width: 20, height: 20 }} />
                                    </button>

                                    <div style={{ display: "flex", gap: "0.25rem" }}>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum = currentPage;
                                            if (totalPages <= 5) pageNum = i + 1;
                                            else if (currentPage <= 3) pageNum = i + 1;
                                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = currentPage - 2 + i;

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    style={{
                                                        width: 36, height: 36, borderRadius: "0.75rem",
                                                        background: currentPage === pageNum ? "#10b981" : "transparent",
                                                        border: "none", color: currentPage === pageNum ? "white" : "#64748b",
                                                        fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                                                    }}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        style={{ padding: "0.5rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.05)", border: "none", color: currentPage === totalPages ? "#334155" : "#f8fafc", cursor: currentPage === totalPages ? "default" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
                                    >
                                        <ChevronRight style={{ width: 20, height: 20 }} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
