"use client";

import { useEffect, useState } from "react";
import { Users, Send, Clock, TrendingUp, Loader2, Wifi, WifiOff, Play, CheckCircle2, AlertCircle, X } from "lucide-react";
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLang } from "@/context/LangContext";
import { apiFetch } from "@/lib/apiFetch";

const DAYS_IT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface StatusData {
  whatsapp: { status: string; phoneNumber?: string; name?: string; quality?: string; error?: string };
  contacts: { total: number; sent: number; pending: number; failed: number; deliveryRate: number };
  config: { messagesPerDay: number; delayBetweenMessages: number };
}

export default function Dashboard() {
  const { t } = useLang();
  const D = t.dashboard;
  const DAYS = t.locale === "it" ? DAYS_IT : DAYS_ES;

  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [chart, setChart] = useState<{ name: string; envios: number }[]>([]);

  // Custom notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchStatus = () => {
    apiFetch("/status")
      .then((r) => r.json())
      .then((data: StatusData) => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();

    apiFetch("/contacts")
      .then((r) => r.json())
      .then((contacts: any[]) => {
        if (!Array.isArray(contacts)) return;
        const chartData = DAYS.map((name, idx) => ({
          name,
          envios: contacts.filter((c) => {
            if (!c.createdAt) return false;
            const ms = c.createdAt._seconds ? c.createdAt._seconds * 1000 : new Date(c.createdAt).getTime();
            return new Date(ms).getDay() === idx && c.messageSent;
          }).length,
        }));
        setChart(chartData);
      });
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5s
  };

  const handleStartCampaign = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const res = await apiFetch("/messages/start-campaign", { method: "POST" });
      if (res.ok) {
        setTimeout(fetchStatus, 2000);
        showToast('success', D.campaignSuccess);
      } else {
        showToast('error', D.campaignError);
      }
    } catch {
      showToast('error', t.locale === 'it' ? '❌ Errore di connessione.' : '❌ Error de conexión.');
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#10b981", gap: "0.75rem" }}>
        <Loader2 style={{ width: 32, height: 32, animation: "spin 1s linear infinite" }} />
        <span style={{ fontWeight: 600, fontSize: "1rem" }}>Caricamento...</span>
      </div>
    );
  }

  const c = status?.contacts;
  const wa = status?.whatsapp;
  const isWaActive = wa?.status === "active";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "relative" }}>

      {/* Personalized Floating Notification */}
      {notification && (
        <div style={{
          position: "fixed",
          top: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          animation: "slideIn 0.3s ease-out forwards",
          width: "calc(100% - 2rem)",
          maxWidth: "400px"
        }}>
          <div style={{
            background: notification.type === 'success' ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
            backdropFilter: "blur(12px)",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "1rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            {notification.type === 'success' ? <CheckCircle2 style={{ width: 24, height: 24 }} /> : <AlertCircle style={{ width: 24, height: 24 }} />}
            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "white", cursor: "pointer", opacity: 0.7 }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>
      )}

      <header style={{ marginTop: "4rem" }} className="mobile-only" />
      <header className="desktop-only" />

      <header>
        <h2 style={{ fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{D.title}</h2>
        <p style={{ color: "#64748b", marginTop: "0.25rem" }}>{D.subtitle}</p>
      </header>

      {/* Stats */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
        <StatCard title={D.totalContacts} value={(c?.total ?? 0).toLocaleString()} sub={D.imported} icon={Users} />
        <StatCard title={D.sent} value={(c?.sent ?? 0).toLocaleString()} sub={D.total} icon={Send} color="#10b981" />
        <StatCard title={D.pending} value={(c?.pending ?? 0).toLocaleString()} sub={D.queue} icon={Clock} color="#f59e0b" />
        <StatCard title={D.rate} value={`${c?.deliveryRate ?? 0}%`} sub={D.average} icon={TrendingUp} color="#3b82f6" />
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Chart */}
        <div className="glass" style={{ borderRadius: "1.5rem", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.5rem" }}>{D.chartTitle}</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart.length > 0 ? chart : DAYS.map(n => ({ name: n, envios: 0 }))}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 12 }} itemStyle={{ color: "#10b981" }} />
                <Area type="monotone" dataKey="envios" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#cg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Status */}
        <div className="glass" style={{ borderRadius: "1.5rem", padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{D.systemStatus}</h3>

          <div className="glass" style={{ borderRadius: "0.75rem", padding: "0.875rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b", fontSize: "0.875rem" }}>{D.whatsapp}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: isWaActive ? "#10b981" : "#f87171", animation: "pulse 2s infinite" }} />
                {isWaActive
                  ? <Wifi style={{ width: 16, height: 16, color: "#10b981" }} />
                  : <WifiOff style={{ width: 16, height: 16, color: "#f87171" }} />
                }
                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: isWaActive ? "#10b981" : "#f87171" }}>
                  {isWaActive ? D.active : "Offline"}
                </span>
              </div>
            </div>
            {isWaActive && wa?.phoneNumber && (
              <p style={{ color: "#475569", fontSize: "0.7rem", marginTop: "0.25rem" }}>
                {wa.phoneNumber} · {wa.name}
              </p>
            )}
          </div>

          <StatusRow label={D.totalDB} value={(c?.total ?? 0).toString()} dot="#3b82f6" />
          <StatusRow label={D.queueStatus} value={(c?.pending ?? 0) > 0 ? D.processing : D.empty} dot={(c?.pending ?? 0) > 0 ? "#10b981" : "#3b82f6"} />

          <button
            onClick={handleStartCampaign}
            disabled={isStarting}
            className="btn-primary"
            style={{
              marginTop: "auto",
              padding: "0.875rem",
              borderRadius: "0.75rem",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              opacity: isStarting ? 0.7 : 1
            }}
          >
            {isStarting ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <Play style={{ width: 18, height: 18 }} />}
            {D.startCampaign}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, color = "#64748b" }: any) {
  return (
    <div className="glass" style={{ borderRadius: "1.5rem", padding: "1.5rem" }}>
      <div style={{ width: 40, height: 40, borderRadius: "0.75rem", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
        <Icon style={{ width: 20, height: 20, color }} />
      </div>
      <p style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 500 }}>{title}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.25rem" }}>
        <span style={{ fontSize: "1.75rem", fontWeight: 700 }}>{value}</span>
        <span style={{ fontSize: "0.65rem", color: "#475569", fontWeight: 700, textTransform: "uppercase" }}>{sub}</span>
      </div>
    </div>
  );
}

function StatusRow({ label, value, dot }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "0.875rem 1rem", borderRadius: "0.75rem" }}>
      <span style={{ color: "#64748b", fontSize: "0.875rem" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot, animation: "pulse 2s infinite" }} />
        <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{value}</span>
      </div>
    </div>
  );
}
