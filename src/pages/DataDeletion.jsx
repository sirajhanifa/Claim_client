import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, AlertTriangle, Shield, RefreshCcw, Calendar } from "lucide-react";
import useFetch from '../hooks/useFetch';

const DataDeletion = () => {

    const API_URL = import.meta.env.VITE_API_URL;
    const [selectedLabel, setSelectedLabel] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    const { data: academics = [], loading: fetchLoading } = useFetch(`${API_URL}/api/getAcademic`);

    useEffect(() => {
        if (academics.length > 0) {
            setSelectedLabel(academics[0].academic_sem_label);
        }
    }, [academics]);

    const handleDelete = async () => {

        if (!selectedLabel) {
            setMsg({ type: 'error', text: "Please select an academic semester." });
            return;
        }

        if (!adminPassword) {
            setMsg({ type: 'error', text: "Admin password is required." });
            return;
        }

        const confirm = window.confirm(
            `CRITICAL ACTION: Are you sure you want to PERMANENTLY DELETE all claim records for the semester "${selectedLabel}"? This cannot be undone.`
        );
        if (!confirm) return;

        setLoading(true);
        setMsg(null);

        try {
            const res = await axios.post(
                `${API_URL}/api/data-deletion/delete-by-academic-sem`,
                { academic_sem_label: selectedLabel, admin_password: adminPassword }
            );
            setMsg({ type: 'success', text: res.data.message });
            setAdminPassword("");
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || "Critical Error: Failed to purge data." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>

            {/* Header Section */}
            <header className="mb-8 space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                    <div className="h-1 w-8 bg-blue-600 rounded-full" />
                    System Maintenance
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    Data <span className="text-slate-400 font-light">Purge</span>
                </h1>
            </header>

            {/* Warning Card */}
            <div className="bg-white max-w-xl rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-red-50 bg-red-50/30 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-red-900 uppercase tracking-tight">Danger Zone</h3>
                        <p className="text-xs text-red-700/70 font-medium">Bulk deletion of records is permanent.</p>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Target Academic Semester
                        </label>
                        <div className="relative mt-4">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={selectedLabel}
                                onChange={(e) => setSelectedLabel(e.target.value)}
                                disabled={fetchLoading}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all text-sm font-bold appearance-none disabled:opacity-50"
                            >
                                {fetchLoading ? (
                                    <option>Loading semesters...</option>
                                ) : (
                                    academics.map(academic => (
                                        <option key={academic._id} value={academic.academic_sem_label}>
                                            {academic.academic_sem_label}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Admin Authorization Password
                        </label>
                        <div className="relative mt-4">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all text-sm font-bold"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleDelete}
                        disabled={loading || !selectedLabel || !adminPassword}
                        className="group w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 text-white py-4 rounded-xl font-bold transition-all shadow-red-100 active:scale-[0.98]"
                    >
                        {loading ? (
                            <RefreshCcw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Trash2 className="w-5 h-5 group-hover:shake" />
                        )}
                        <span>{loading ? "Processing Purge..." : "Purge Semester Records"}</span>
                    </button>

                    {msg && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 ${msg.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${msg.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {msg.text}
                        </div>
                    )}
                </div>

                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                        Authorized Personnel Only • Audit Log will be updated
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DataDeletion;