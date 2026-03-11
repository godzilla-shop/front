"use client";

import { Settings, Save, RefreshCw, Loader2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useLang } from "@/context/LangContext";
import { apiFetch } from "@/lib/apiFetch";

export default function ConfigPage() {
    const { t } = useLang();
    const CF = t.config;

    const [delay, setDelay] = useState<number>(2);
    const [perDay, setPerDay] = useState<number>(50);
    const [startTime, setStartTime] = useState<string>("09:00");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    // Load config from backend on mount
    useEffect(() => {
        apiFetch(`/config`)
            .then((r) => r.json())
            .then((data) => {
                if (data.messagesPerDay !== undefined) setPerDay(data.messagesPerDay);
                if (data.delayBetweenMessages !== undefined) setDelay(data.delayBetweenMessages);
                if (data.startTime !== undefined) setStartTime(data.startTime);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const res = await apiFetch(`/config`, {
                method: "PUT",
                body: JSON.stringify({
                    messagesPerDay: perDay,
                    delayBetweenMessages: delay,
                    startTime: startTime
                }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            } else {
                setError("Error al guardar. Intenta de nuevo.");
            }
        } catch {
            setError("No se pudo conectar con el servidor.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setDelay(2);
        setPerDay(50);
        setStartTime("09:00");
        setSaved(false);
    };

    return (
        <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: "2rem" }}>
            <header style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 48, height: 48, background: "rgba(16,185,129,0.1)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Settings style={{ width: 24, height: 24, color: "#10b981" }} />
                </div>
                <div>
                    <h2 style={{ fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{CF.title}</h2>
                    <p style={{ color: "#64748b", marginTop: "0.25rem" }}>{CF.subtitle}</p>
                </div>
            </header>

            <div className="glass" style={{ borderRadius: "1.5rem", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem" }}>{CF.sendParams}</h3>

                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#10b981", padding: "2rem 0" }}>
                        <Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite" }} />
                        <span style={{ fontWeight: 600 }}>Caricamento configurazione...</span>
                    </div>
                ) : (
                    <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>{CF.startTime}</label>
                            <div style={{ position: "relative" }}>
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#64748b' }} />
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    style={{
                                        width: "100%",
                                        background: "rgba(15,23,42,0.5)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        borderRadius: "1rem",
                                        padding: "1rem 1.25rem 1rem 3rem",
                                        color: "#f8fafc",
                                        fontFamily: "inherit",
                                        fontSize: "1rem",
                                        outline: "none"
                                    }}
                                />
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "#475569", paddingLeft: "0.25rem" }}>{CF.startTimeHelp}</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>{CF.perDay}</label>
                            <input
                                type="number"
                                value={perDay}
                                min={1}
                                max={1000}
                                onChange={(e) => setPerDay(Number(e.target.value))}
                                style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1rem 1.25rem", color: "#f8fafc", fontFamily: "inherit", fontSize: "1rem", outline: "none" }}
                            />
                            <p style={{ fontSize: "0.75rem", color: "#475569", paddingLeft: "0.25rem" }}>{CF.perDayHelp}</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>{CF.delay}</label>
                            <input
                                type="number"
                                value={delay}
                                min={1}
                                max={300}
                                onChange={(e) => setDelay(Number(e.target.value))}
                                style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1rem 1.25rem", color: "#f8fafc", fontFamily: "inherit", fontSize: "1rem", outline: "none" }}
                            />
                            <p style={{ fontSize: "0.75rem", color: "#475569", paddingLeft: "0.25rem" }}>{CF.delayHelp}</p>
                        </div>

                        {error && (
                            <p style={{ color: "#f87171", fontSize: "0.875rem", fontWeight: 600, background: "rgba(239,68,68,0.08)", padding: "0.75rem 1rem", borderRadius: "0.75rem" }}>{error}</p>
                        )}

                        <div style={{ display: "flex", gap: "1rem", paddingTop: "0.5rem" }}>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary"
                                style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: saving ? 0.7 : 1 }}
                            >
                                {saving
                                    ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                                    : <Save style={{ width: 16, height: 16 }} />
                                }
                                {saved ? (t.locale === 'it' ? "✓ Salvato!" : "✓ Guardado!") : CF.save}
                            </button>
                            <button
                                onClick={handleReset}
                                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1.5rem", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "0.75rem", color: "#64748b", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.875rem" }}
                            >
                                <RefreshCw style={{ width: 16, height: 16 }} />{CF.reset}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
