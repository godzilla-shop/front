"use client";

import { useState } from "react";
import { FileUp, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { apiFetch } from "@/lib/apiFetch";

export default function ImportPage() {
    const { t } = useLang();
    const I = t.import;

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setStatus("idle");
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await apiFetch(`/import`, { method: "POST", body: formData });
            setStatus(res.ok ? "success" : "error");
        } catch {
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
            <header style={{ textAlign: "center" }}>
                <h2 className="gradient-text" style={{ fontSize: "2.25rem", fontWeight: 700 }}>{I.title}</h2>
                <p style={{ color: "#64748b", marginTop: "0.5rem" }}>{I.subtitle}</p>
            </header>

            <div className="glass" style={{ borderRadius: "2rem", padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", border: "2px dashed rgba(16,185,129,0.2)" }}>
                <div style={{ width: 72, height: 72, background: "rgba(16,185,129,0.1)", borderRadius: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileUp style={{ width: 36, height: 36, color: "#10b981" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                    <label style={{ cursor: "pointer" }}>
                        <span className="btn-primary" style={{ padding: "0.75rem 2rem", display: "inline-block" }}>{I.select}</span>
                        <input type="file" style={{ display: "none" }} accept=".xlsx,.xls" onChange={(e) => { setFile(e.target.files?.[0] || null); setStatus("idle"); }} />
                    </label>
                    <p style={{ color: "#64748b", marginTop: "1rem", fontSize: "0.875rem" }}>
                        {file ? `${I.selected} ${file.name}` : I.formats}
                    </p>
                </div>
                {file && !loading && status === "idle" && (
                    <button onClick={handleUpload} style={{ background: "#f8fafc", color: "#0f172a", fontWeight: 700, padding: "1rem 3rem", borderRadius: "1rem", border: "none", cursor: "pointer", fontSize: "1rem" }}>
                        {I.start}
                    </button>
                )}
                {loading && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#10b981", fontWeight: 700 }}>
                        <Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite" }} />{I.loading}
                    </div>
                )}
                {status === "success" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1.5rem", borderRadius: "1rem", background: "rgba(16,185,129,0.1)", color: "#10b981", fontWeight: 700 }}>
                        <CheckCircle2 style={{ width: 22, height: 22 }} />{I.success}
                    </div>
                )}
                {status === "error" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1.5rem", borderRadius: "1rem", background: "rgba(239,68,68,0.1)", color: "#f87171", fontWeight: 700 }}>
                        <AlertCircle style={{ width: 22, height: 22 }} />{I.error}
                    </div>
                )}
            </div>

            <div className="glass" style={{ borderRadius: "1.5rem", padding: "2rem" }}>
                <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>{I.requirements}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    {[I.req1, I.req2, I.req3, I.req4].map((r) => (
                        <div key={r} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.75rem", fontSize: "0.875rem", color: "#64748b" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />{r}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
