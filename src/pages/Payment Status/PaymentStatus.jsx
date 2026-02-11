import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
	Search, Calendar, FileText, CheckCircle2,
	IndianRupee, Layers, ChevronRight, ArrowUpRight,
	Download, Filter, AlertCircle, Loader2
} from "lucide-react";

const PaymentStatus = () => {

	const API_URL = import.meta.env.VITE_API_URL;

	const [prList, setPrList] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedPrId, setSelectedPrId] = useState(null);
	const [claims, setClaims] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchPrIds = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/admin/payment-status/pr-ids`);
			setPrList(res.data || []);
		} catch (err) {
			setError("Failed to load report IDs.");
		}
	};

	const fetchClaims = useCallback(async (prId) => {
		setLoading(true);
		setSelectedPrId(prId);
		setError(null);
		try {
			const res = await axios.get(`${API_URL}/api/admin/payment-status/claims/${prId}`);
			setClaims(res.data || []);
		} catch (err) {
			setError("Could not retrieve claim details.");
		} finally {
			setLoading(false);
		}
	}, [API_URL]);

	useEffect(() => {
		fetchPrIds();
	}, []);

	const filteredPrList = useMemo(() =>
		prList.filter(pr =>
			pr.payment_report_id.toLowerCase().includes(searchTerm.toLowerCase())
		), [prList, searchTerm]
	);

	const displayedClaims = useMemo(() => {
		const map = new Map();
		claims.forEach(c => {
			const key = `${c.staff_name}-${c.phone_number}-${c.claim_type_name}-${c.payment_report_id}`;
			if (!map.has(key)) {
				map.set(key, { ...c, totalAmount: c.amount, count: 1 });
			} else {
				const ex = map.get(key);
				ex.totalAmount += c.amount;
				ex.count += 1;
			}
		});
		return Array.from(map.values());
	}, [claims]);

	const totalPrAmount = useMemo(() =>
		displayedClaims.reduce((sum, c) => sum + c.totalAmount, 0),
		[displayedClaims]
	);

	return (
		<div className="font-sans text-slate-900">
			<div className="space-y-8">

				{/* Header Section */}
				<header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
							<div className="h-1 w-8 bg-blue-600 rounded-full" />
							Financial Operations
						</div>
						<h1 className="text-4xl xl:text-4xl font-extrabold text-slate-900 tracking-tight">
							Payment <span className="text-slate-400 font-light">Reports</span>
						</h1>
					</div>

					<div className="flex items-center gap-3">
						<div className="relative group">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
							<input
								type="text"
								placeholder="Search Report ID..."
								className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80 text-md transition-all outline-none"
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

					{/* Sidebar */}
					<aside className="lg:col-span-3 space-y-4">
						<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
							<div className="p-5 border-b border-slate-100 flex justify-between items-center">
								<h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Batches</h3>
								<span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-bold">
									{filteredPrList.length}
								</span>
							</div>
							<div className="flex-1 overflow-y-auto overflow-x-hidden">
								{filteredPrList.length > 0 ? (
									filteredPrList.map((pr) => (
										<button
											key={pr.payment_report_id}
											onClick={() => fetchClaims(pr.payment_report_id)}
											className={`w-full text-left p-4 transition-all relative border-b border-slate-50 group
                        					${selectedPrId === pr.payment_report_id ? "bg-blue-50/50" : "hover:bg-slate-50"}`}
										>
											{selectedPrId === pr.payment_report_id && (
												<div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
											)}
											<div className="flex justify-between items-start mb-1">
												<span className={`font-mono font-bold text-sm ${selectedPrId === pr.payment_report_id ? "text-blue-700" : "text-slate-700"}`}>
													{pr.payment_report_id}
												</span>
												<ChevronRight className={`w-4 h-4 transition-transform ${selectedPrId === pr.payment_report_id ? "text-blue-600 translate-x-1" : "text-slate-300"}`} />
											</div>
											<p className="text-xs text-slate-400 font-medium">{pr.count} claims in batch</p>
										</button>
									))
								) : (
									<div className="p-8 text-center text-slate-400 text-sm italic">No reports found</div>
								)}
							</div>
						</div>
					</aside>

					{/* Main Panel */}
					<main className="lg:col-span-9 space-y-6">
						{!selectedPrId ? (
							<EmptyState icon={<FileText />} title="Select a Report" description="Please choose a payment report from the sidebar to audit the claim details." />
						) : (
							<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

								{/* Dashboard Stats */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<StatCard label="Batch Total" value={`₹${totalPrAmount.toLocaleString()}`} icon={<IndianRupee />} theme="indigo" />
									<StatCard label="Processed Claims" value={displayedClaims.length} icon={<Layers />} theme="blue" />
									<StatCard label="Report Reference" value={selectedPrId} icon={<ArrowUpRight />} theme="slate" isMono />
								</div>

								{/* Main Table Container */}
								<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
									<div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
										<h3 className="font-bold text-slate-800">Claim Breakdown</h3>
									</div>

									{loading ? (
										<div className="py-32 flex flex-col items-center justify-center text-slate-400">
											<Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
											<p className="font-medium animate-pulse">Syncing financial data...</p>
										</div>
									) : error ? (
										<div className="py-20 text-center text-red-500 flex flex-col items-center">
											<AlertCircle className="w-10 h-10 mb-2" />
											<p>{error}</p>
										</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full text-center border-collapse">
												<thead>
													<tr className="bg-slate-50/50">
														<th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Beneficiary</th>
														<th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
														<th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settlement</th>
														<th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cycle</th>
														<th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outcome</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-slate-100">
													{displayedClaims.map((c, i) => (
														<tr key={i} className="hover:bg-slate-50 transition-colors group">
															<td className="px-6 py-5">
																<div>
																	<p className="font-bold text-slate-800 text-sm text-center">{c.staff_name}</p>
																	{c.count > 1 && (
																		<span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black tracking-tighter uppercase">
																			Merged Batch ({c.count})
																		</span>
																	)}
																</div>
															</td>
															<td className="px-6 py-5">
																<span className="text-xs font-semibold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg">
																	{c.claim_type_name}
																</span>
															</td>
															<td className="px-6 py-5 font-mono font-bold text-slate-900">
																₹{c.totalAmount.toLocaleString()}
															</td>
															<td className="px-6 py-5">
																<div className="flex flex-col justify-center items-center gap-1">
																	<div className="flex items-center text-[10px] text-slate-400 font-bold">
																		<Calendar className="w-3 h-3 mr-1.5" /> {c.submission_date ? new Date(c.submission_date).toLocaleDateString() : "--"}
																	</div>
																	<div className="flex items-center text-[10px] text-emerald-600 font-bold">
																		<CheckCircle2 className="w-3 h-3 mr-1.5" /> {c.credited_date ? new Date(c.credited_date).toLocaleDateString() : "Processing"}
																	</div>
																</div>
															</td>
															<td className="px-6 py-5 text-center">
																<StatusBadge status={c.status} />
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
								</div>
							</div>
						)}
					</main>
				</div>
			</div>
		</div>
	);
};

/* Internal Sub-components */

const EmptyState = ({ icon, title, description }) => (
	<div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center p-12">
		<div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
			{React.cloneElement(icon, { size: 32 })}
		</div>
		<h3 className="text-lg font-bold text-slate-800">{title}</h3>
		<p className="text-slate-400 max-w-xs mt-1 text-sm">{description}</p>
	</div>
);

const StatCard = ({ label, value, icon, theme, isMono }) => {
	const themes = {
		indigo: "bg-indigo-50 text-indigo-600",
		blue: "bg-blue-50 text-blue-600",
		slate: "bg-slate-50 text-slate-600"
	};

	return (
		<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
			<div className={`w-12 h-12 rounded-xl flex items-center justify-center ${themes[theme]}`}>
				{React.cloneElement(icon, { size: 20 })}
			</div>
			<div>
				<p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 leading-none">{label}</p>
				<p className={`text-xl font-extrabold text-slate-800 ${isMono ? 'font-mono' : ''}`}>{value}</p>
			</div>
		</div>
	);
};

const StatusBadge = ({ status }) => {
	const isCredited = status?.toLowerCase() === "credited";
	return (
		<span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all
      ${isCredited ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
			<span className={`w-1.5 h-1.5 rounded-full ${isCredited ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
			{status}
		</span>
	);
};

export default PaymentStatus;