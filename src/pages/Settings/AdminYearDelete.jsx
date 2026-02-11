import React, { useState } from "react";
import axios from "axios";
import { Trash2, AlertTriangle, Database, RefreshCcw } from "lucide-react";

const AdminYearDelete = () => {

	const API_URL = import.meta.env.VITE_API_URL;
	const [year, setYear] = useState("");
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState("");

	const handleDelete = async () => {

		if (!year) {
			alert("Please specify a target year.");
			return;
		}

		const confirm = window.confirm(
			`CRITICAL ACTION: Are you sure you want to PERMANENTLY DELETE all claim records for the year ${year}? This cannot be undone.`
		);
		if (!confirm) return;

		setLoading(true);
		setMsg("");

		try {
			const res = await axios.delete(
				`${API_URL}/api/admin/maintenance/delete-year/${year}`
			);
			setMsg({ type: 'success', text: res.data.message });
		} catch (err) {
			setMsg({ type: 'error', text: "Critical Error: Failed to purge data." });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>

			{/* Header Section */}
			<header className="mb-8 space-y-2">
				<div className="flex items-center gap-2 text-red-600 font-semibold text-sm uppercase tracking-wider">
					<div className="h-1 w-8 bg-red-600 rounded-full" />
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
						<p className="text-xs text-red-700/70 font-medium">Bulk deletion of financial records is permanent.</p>
					</div>
				</div>

				<div className="p-8 space-y-6">
					<div className="space-y-1.5">
						<label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
							Target Fiscal Year
						</label>
						<div className="relative mt-4">
							<Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<input
								type="number"
								value={year}
								onChange={(e) => setYear(e.target.value)}
								className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all text-sm font-bold"
								placeholder="e.g. 2025"
							/>
						</div>
					</div>

					<button
						onClick={handleDelete}
						disabled={loading || !year}
						className="group w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 text-white py-4 rounded-xl font-bold transition-all shadow-red-100 active:scale-[0.98]"
					>
						{loading ? (
							<RefreshCcw className="w-5 h-5 animate-spin" />
						) : (
							<Trash2 className="w-5 h-5 group-hover:shake" />
						)}
						<span>{loading ? "Processing Purge..." : "Purge Annual Records"}</span>
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

export default AdminYearDelete;