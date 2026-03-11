"use client";

import { useEffect, useState, useRef } from "react";
import {
    Search, Filter, CheckCircle2, Clock, MoreHorizontal, Plus, Users, X,
    User, Phone, Loader2, Edit2, Trash2, Power, PowerOff, AlertTriangle,
    ChevronLeft, ChevronRight
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import { apiFetch } from "@/lib/apiFetch";

export default function ContactsPage() {
    const { t } = useLang();
    const C = t.contacts;

    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 20;

    // Modal & Menu States
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Form States
    const [formData, setFormData] = useState({ name: "", phone: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    const fetchContacts = (page: number = 1, searchQuery: string = "") => {
        setLoading(true);
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search: searchQuery
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

    // debouncing search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchContacts(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setSelectedContact(null);
        setFormData({ name: "", phone: "" });
        setError("");
        setShowModal(true);
    };

    const handleOpenEditModal = (contact: any) => {
        setIsEditing(true);
        setSelectedContact(contact);
        setFormData({ name: contact.name, phone: contact.phone });
        setError("");
        setShowModal(true);
        setOpenMenuId(null);
    };

    const handleDeleteClick = (contact: any) => {
        setSelectedContact(contact);
        setShowDeleteConfirm(true);
        setOpenMenuId(null);
    };

    const handleSaveContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) return;

        setIsSaving(true);
        setError("");

        try {
            const method = isEditing ? "PATCH" : "POST";
            const url = isEditing ? `/contacts/${selectedContact.id}` : `/contacts`;

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.duplicated && !isEditing) {
                    setError(t.locale === 'it' ? "Questo contatto esiste già." : "Este contacto ya existe.");
                } else {
                    setShowModal(false);
                    fetchContactsWithCurrent();
                }
            } else {
                setError(data.error || "Error al guardar");
            }
        } catch (err) {
            setError("Error de conexión");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteContact = async () => {
        if (!selectedContact) return;
        setIsDeleting(true);
        try {
            const res = await apiFetch(`/contacts/${selectedContact.id}`, { method: "DELETE" });
            if (res.ok) {
                setShowDeleteConfirm(false);
                fetchContactsWithCurrent();
            }
        } catch (err) {
            alert("Error al eliminar");
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleStatus = async (contact: any) => {
        try {
            const newStatus = !contact.active;
            const res = await apiFetch(`/contacts/${contact.id}`, {
                method: "PATCH",
                body: JSON.stringify({ active: newStatus }),
            });
            if (res.ok) {
                setContacts(contacts.map(c => c.id === contact.id ? { ...c, active: newStatus } : c));
            }
        } catch (err) {
            console.error("Failed to toggle status");
        }
    };

    const fetchContactsWithCurrent = () => fetchContacts(currentPage, debouncedSearch);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{C.title}</h2>
                    <p style={{ color: "#64748b", marginTop: "0.25rem" }}>{C.subtitle}</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                    <Plus style={{ width: 18, height: 18 }} />{C.newContact}
                </button>
            </header>

            <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#64748b" }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={C.search}
                        style={{ width: "100%", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "0.875rem 1rem 0.875rem 2.75rem", color: "#f8fafc", fontFamily: "inherit", fontSize: "0.875rem", outline: "none" }}
                    />
                </div>
                <button style={{ padding: "0 1.5rem", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", color: "#64748b", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                    <Filter style={{ width: 16, height: 16 }} />{C.filters}
                </button>
            </div>

            <div className="table-responsive" style={{ background: "rgba(15,23,42,0.3)", borderRadius: "2rem", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            {[C.name, C.phone, C.status, C.actions].map((h, i) => (
                                <th key={h} style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#475569", textAlign: i === 3 ? "right" : "left" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <tr key={i}>
                                    <td colSpan={4} style={{ padding: "1.5rem 1.5rem" }}>
                                        <div style={{ height: "2rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.5rem", animation: "pulse 2s infinite" }}></div>
                                    </td>
                                </tr>
                            ))
                        ) : contacts.length > 0 ? (
                            contacts.map((contact) => (
                                <tr key={contact.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.2s" }} className="table-row">
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: contact.active ? "rgba(16,185,129,0.12)" : "rgba(100,116,139,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: contact.active ? "#10b981" : "#64748b", fontWeight: 700, fontSize: "0.875rem" }}>
                                                {(contact.name || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, opacity: contact.active ? 1 : 0.5 }}>{contact.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem", color: "#64748b", opacity: contact.active ? 1 : 0.5 }}>{contact.phone}</td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            {contact.messageSent ? (
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#10b981", background: "rgba(16,185,129,0.1)" }}>
                                                    <CheckCircle2 style={{ width: 12, height: 12 }} />{C.sent}
                                                </div>
                                            ) : (
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#f59e0b", background: "rgba(245,158,11,0.1)" }}>
                                                    <Clock style={{ width: 12, height: 12 }} />{C.pending}
                                                </div>
                                            )}

                                            {/* Toggle Switch */}
                                            <button
                                                onClick={() => toggleStatus(contact)}
                                                style={{
                                                    width: 34,
                                                    height: 18,
                                                    borderRadius: 99,
                                                    background: contact.active ? "#10b981" : "#334155",
                                                    border: "none",
                                                    position: "relative",
                                                    cursor: "pointer",
                                                    transition: "all 0.3s"
                                                }}
                                            >
                                                <div style={{
                                                    width: 14, height: 14, background: "white", borderRadius: "50%",
                                                    position: "absolute", top: 2,
                                                    left: contact.active ? 18 : 2,
                                                    transition: "all 0.3s"
                                                }} />
                                            </button>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem", textAlign: "right", position: "relative" }}>
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === contact.id ? null : contact.id)}
                                            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", padding: "0.5rem" }}
                                        >
                                            <MoreHorizontal style={{ width: 20, height: 20 }} />
                                        </button>

                                        {openMenuId === contact.id && (
                                            <div
                                                ref={menuRef}
                                                style={{
                                                    position: "absolute", right: "2rem", top: "3.5rem", zIndex: 10,
                                                    background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "0.75rem", padding: "0.5rem", width: 160,
                                                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)"
                                                }}
                                            >
                                                <button
                                                    onClick={() => handleOpenEditModal(contact)}
                                                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", padding: "0.6rem 0.75rem", background: "none", border: "none", color: "#f8fafc", cursor: "pointer", borderRadius: "0.5rem" }}
                                                    className="menu-item"
                                                >
                                                    <Edit2 style={{ width: 14, height: 14 }} /> {C.edit}
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(contact)}
                                                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", padding: "0.6rem 0.75rem", background: "none", border: "none", color: "#f8fafc", cursor: "pointer", borderRadius: "0.5rem" }}
                                                    className="menu-item"
                                                >
                                                    {contact.active ? <PowerOff style={{ width: 14, height: 14 }} /> : <Power style={{ width: 14, height: 14 }} />}
                                                    {contact.active ? C.deactivate : C.activate}
                                                </button>
                                                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.4rem 0" }} />
                                                <button
                                                    onClick={() => handleDeleteClick(contact)}
                                                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", padding: "0.6rem 0.75rem", background: "none", border: "none", color: "#f87171", cursor: "pointer", borderRadius: "0.5rem" }}
                                                    className="menu-item"
                                                >
                                                    <Trash2 style={{ width: 14, height: 14 }} /> {C.delete}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} style={{ padding: "5rem 2rem", textAlign: "center" }}>
                                    <Users style={{ width: 32, height: 32, color: "#334155", margin: "0 auto 1rem" }} />
                                    <p style={{ color: "#64748b", fontWeight: 500 }}>{C.empty}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem", background: "rgba(15,23,42,0.2)", borderRadius: "1.5rem" }}>
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
                                // Simple logic to show a few pages around current
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

            {/* Modal de Agregar/Editar Contacto */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
                    <div className="glass" style={{ width: "90%", maxWidth: 450, borderRadius: "2rem", padding: "2.5rem", position: "relative" }}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{ position: "absolute", right: "2rem", top: "2rem", background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}
                        >
                            <X style={{ width: 24, height: 24 }} />
                        </button>

                        <div style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>{isEditing ? C.edit : C.newContact}</h3>
                            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>{t.locale === 'it' ? 'Gestisci le informazioni del contatto.' : 'Gestiona la información del contacto.'}</p>
                        </div>

                        <form onSubmit={handleSaveContact} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>{C.name}</label>
                                <div style={{ position: "relative" }}>
                                    <User style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "#64748b" }} />
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Mario Rossi"
                                        style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "1rem 1rem 1rem 3rem", color: "#f8fafc", outline: "none" }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>{C.phone}</label>
                                <div style={{ position: "relative" }}>
                                    <Phone style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "#64748b" }} />
                                    <input
                                        required
                                        disabled={isEditing}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Ej: 3713985074"
                                        style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "1rem 1rem 1rem 3rem", color: "#f8fafc", outline: "none", opacity: isEditing ? 0.5 : 1 }}
                                    />
                                </div>
                                {isEditing && <p style={{ fontSize: "0.6rem", color: "#475569" }}>{t.locale === 'it' ? '*Il numero non può essere modificato perché è l\'ID univoco.' : '*El número no se puede cambiar porque es el ID único.'}</p>}
                            </div>

                            {error && (
                                <p style={{ color: "#f87171", fontSize: "0.875rem", fontWeight: 600, background: "rgba(239,68,68,0.08)", padding: "0.75rem 1rem", borderRadius: "1rem" }}>{error}</p>
                            )}

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn-primary"
                                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                                >
                                    {isSaving ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : isEditing ? <Edit2 style={{ width: 18, height: 18 }} /> : <Plus style={{ width: 18, height: 18 }} />}
                                    {isEditing ? C.save : (t.locale === 'it' ? 'Aggiungi' : 'Agregar')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: "1rem", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "1rem", color: "#64748b", fontWeight: 700, cursor: "pointer" }}
                                >
                                    {C.cancel}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Confirmación Eliminación */}
            {showDeleteConfirm && (
                <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
                    <div className="glass" style={{ width: "90%", maxWidth: 400, borderRadius: "2rem", padding: "2.5rem", textAlign: "center" }}>
                        <div style={{ width: 60, height: 60, borderRadius: "1.5rem", background: "rgba(239,68,68,0.1)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                            <AlertTriangle style={{ width: 30, height: 30 }} />
                        </div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>{C.delete}</h3>
                        <p style={{ color: "#64748b", marginBottom: "2rem", lineHeight: "1.5" }}>{C.confirmDelete}</p>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                onClick={handleDeleteContact}
                                disabled={isDeleting}
                                style={{ flex: 1, padding: "1rem", background: "#f87171", color: "white", border: "none", borderRadius: "1rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                            >
                                {isDeleting ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <Trash2 style={{ width: 18, height: 18 }} />}
                                {C.delete}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{ flex: 1, padding: "1rem", background: "rgba(255,255,255,0.05)", color: "#64748b", border: "none", borderRadius: "1rem", fontWeight: 700, cursor: "pointer" }}
                            >
                                {C.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .table-row:hover {
                    background: rgba(255,255,255,0.02);
                }
                .menu-item:hover {
                    background: rgba(255,255,255,0.05) !important;
                }
            `}</style>
        </div>
    );
}
