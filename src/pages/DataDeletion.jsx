import React, { useState } from "react";
import axios from "axios";
import {
    Trash2, AlertTriangle, Shield, RefreshCcw,
    Calendar, Eye, EyeOff, Download, FileSpreadsheet,
    Lock, CheckCircle2, Info
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useFetch from '../hooks/useFetch';

const DataDeletion = () => {

    const API_URL = import.meta.env.VITE_API_URL;
    const [selectedLabel, setSelectedLabel] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const { data: academics = [], loading: fetchLoading } = useFetch(`${API_URL}/api/getAcademic`);

    const handleExport = async () => {
        if (!selectedLabel) return setMsg({ type: 'error', text: "Select a semester to export." });
        setExportLoading(true);
        setMsg(null);
        try {
            const res = await axios.post(`${API_URL}/api/data-deletion/export-by-academic-sem`, {
                academic_sem_label: selectedLabel
            });
            if (res.data.length === 0) throw new Error("No claim entries found for this semester.");

            const worksheet = XLSX.utils.json_to_sheet(res.data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Claims Backup");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `backup_${selectedLabel}.xlsx`);

            setMsg({ type: 'success', text: `Backup generated successfully.` });
        } catch (err) {
            setMsg({ type: 'error', text: err.message || "Export failed." });
        } finally {
            setExportLoading(false);
        }
    };

    const confirmDelete = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        setMsg(null);
        try {
            const res = await axios.post(`${API_URL}/api/data-deletion/delete-by-academic-sem`, {
                academic_sem_label: selectedLabel,
                admin_password: adminPassword
            });
            setMsg({ type: 'success', text: res.data.message });
            setAdminPassword("");
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || "Critical error: purge failed." });
        } finally {
            setLoading(false);
        }
    };

    const isDeleteEnabled = selectedLabel && adminPassword.trim() !== "";

    return (
        <div className="mx-auto">
            {/* Header Section */}
            <div className="mb-10">
                <header className="mb-8 space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        <div className="h-1 w-8 bg-blue-600 rounded-full" />
                        System Maintenance
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Data <span className="text-slate-400 font-light">Delete</span>
                    </h1>
                </header>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
                        <div className="flex items-center gap-2 text-blue-700 font-bold mb-3">
                            <Info size={18} />
                            <h4 className="text-sm">Standard Protocol</h4>
                        </div>
                        <ul className="text-xs text-blue-800/80 space-y-3 leading-relaxed">
                            <li className="flex gap-2">
                                <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                                <span>Always export data to XLSX before performing a permanent delete.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                                <span>Deleted records cannot be recovered via the admin panel.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                                <span>This action targets claim entries only. Academic definitions remain.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Main Action Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Purge Parameters</h3>
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full tracking-wider border border-amber-200">
                                High Privilege
                            </span>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Inputs Row */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Calendar size={16} className="text-slate-400" /> Select Academic Semester
                                    </label>
                                    <select
                                        value={selectedLabel}
                                        onChange={(e) => setSelectedLabel(e.target.value)}
                                        disabled={fetchLoading}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium"
                                    >
                                        <option value="" disabled>Select    </option>
                                        {fetchLoading ? (
                                            <option disabled>Loading...</option>
                                        ) : (
                                            academics.map(a => (
                                                <option key={a._id} value={a.academic_sem_label}>{a.academic_sem_label}</option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Lock size={16} className="text-slate-400" /> Admin Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                            placeholder="**********"
                                            className="w-full h-12 pl-4 pr-12 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-red-50 focus:border-red-400 outline-none transition-all"
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Export / Backup Section */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex gap-3 items-center">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                                        <FileSpreadsheet size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Need a backup?</p>
                                        <p className="text-xs text-slate-500 font-medium">Export all entries for {selectedLabel || '...'} before purging.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleExport}
                                    disabled={exportLoading || !selectedLabel}
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 active:scale-95"
                                >
                                    {exportLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Download size={16} />}
                                    {exportLoading ? "Processing..." : "Export to XLSX"}
                                </button>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Destructive Action */}
                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        if (selectedLabel && adminPassword.trim()) {
                                            setShowConfirmModal(true);
                                        } else {
                                            setMsg({ type: 'error', text: 'Please select a semester and enter the admin password.' });
                                        }
                                    }}
                                    disabled={loading || !isDeleteEnabled}
                                    className="w-full h-14 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition-all active:scale-[0.98]"
                                >
                                    {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Trash2 size={20} />}
                                    Confirm Data Delete
                                </button>

                                {msg && (
                                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                        {msg.text}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-8 py-3  flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End-to-End Encrypted Handshake</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-red-600 p-8 text-white flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-lg">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-2xl font-bold">Irreversible Action</h3>
                            <p className="text-red-100 text-sm mt-2">You are about to delete all claim data for :</p>
                            <div className="px-4 py-2 bg-black/10 rounded-lg font-bold text-3xl border border-white/20">
                                {selectedLabel}
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <p className="text-slate-600 text-center text-sm leading-relaxed">
                                Proceeding will remove every claim entry associated with this semester from the live database. This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all active:scale-95"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataDeletion;