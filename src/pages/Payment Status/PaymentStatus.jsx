import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search, CreditCard, Calendar, FileText,
  CheckCircle2, Clock, IndianRupee, Layers,
  ChevronRight, ArrowUpRight
} from "lucide-react";

const PaymentStatus = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [prList, setPrList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrId, setSelectedPrId] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPrIds = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/payment-status/pr-ids`);
      setPrList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClaims = async (prId) => {
    setLoading(true);
    setSelectedPrId(prId);
    try {
      const res = await axios.get(`${API_URL}/api/admin/payment-status/claims/${prId}`);
      setClaims(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrIds();
  }, []);

  const filteredPrList = prList.filter(pr =>
    pr.payment_report_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedClaims = useMemo(() => {
    const map = new Map();
    for (const c of claims) {
      const key = `${c.staff_name}-${c.phone_number}-${c.claim_type_name}-${c.payment_report_id}`;
      if (!map.has(key)) {
        map.set(key, { ...c, totalAmount: c.amount, count: 1 });
      } else {
        const ex = map.get(key);
        ex.totalAmount += c.amount;
        ex.count += 1;
      }
    }
    return Array.from(map.values());
  }, [claims]);

  // Derived Stats for the header
  const totalPrAmount = useMemo(() =>
    displayedClaims.reduce((sum, c) => sum + c.totalAmount, 0),
    [displayedClaims]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment Reports</h1>
            <p className="text-slate-500 text-sm">Review and manage staff reimbursement statuses.</p>
          </div> */}

          <div className="mb-10 border-l-4 border-blue-600 pl-6">
            <h2 className="text-4xl font-black tracking-tight italic">
              <span className="text-blue-600">Payment</span>
              <span className="text-slate-900 ml-2">Reports</span>
            </h2>
            <p className="mt-1 text-slate-500 font-medium text-sm">
              Review and manage staff reimbursement statuses.
            </p>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
            <input
              type="text"
              placeholder="Search Report ID..."
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-72 transition-all outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SIDEBAR: PR List */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available Reports</h3>
              </div>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                {filteredPrList.map((pr) => (
                  <button
                    key={pr.payment_report_id}
                    onClick={() => fetchClaims(pr.payment_report_id)}
                    className={`w-full flex items-center justify-between p-4 transition-all border-l-4 ${selectedPrId === pr.payment_report_id
                      ? "bg-indigo-50/50 border-indigo-600"
                      : "bg-white border-transparent hover:bg-slate-50 border-b border-slate-50"
                      }`}
                  >
                    <div className="text-left">
                      <div className={`font-mono font-bold text-sm ${selectedPrId === pr.payment_report_id ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {pr.payment_report_id}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{pr.count} claims associated</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedPrId === pr.payment_report_id ? 'text-indigo-600 translate-x-1' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT: Claims Table */}
          <main className="lg:col-span-9 space-y-6">
            {!selectedPrId ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm text-center p-12">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-indigo-500 opacity-80" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">No Report Selected</h3>
                <p className="text-slate-500 max-w-xs mt-2">Select a payment report ID from the sidebar to view detailed claim breakdowns.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="Total Amount" value={`₹${totalPrAmount.toLocaleString()}`} icon={<IndianRupee className="w-4 h-4" />} color="indigo" />
                  <StatCard label="Claims Count" value={displayedClaims.length} icon={<Layers className="w-4 h-4" />} color="blue" />
                  <StatCard label="Active Report" value={selectedPrId} icon={<ArrowUpRight className="w-4 h-4" />} color="slate" isMono />
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  {loading ? (
                    <div className="p-20 flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-medium">Fetching records...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Staff Member</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Claim Category</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Amount</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Timeline</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayedClaims.map((c, i) => (
                            <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold border border-white shadow-sm">
                                    {c.staff_name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 text-sm leading-none">{c.staff_name}</div>
                                    {c.count > 1 && (
                                      <span className="inline-block mt-1 text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                                        Merged ×{c.count}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded-md">{c.claim_type_name}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-black text-slate-900">₹{c.totalAmount.toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center text-[11px] text-slate-400">
                                    <Calendar className="w-3 h-3 mr-1.5 opacity-70" />
                                    <span>In: {c.submission_date ? new Date(c.submission_date).toLocaleDateString() : "-"}</span>
                                  </div>
                                  <div className="flex items-center text-[11px] text-emerald-500 font-medium">
                                    <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                    <span>Out: {c.credited_date ? new Date(c.credited_date).toLocaleDateString() : "Pending"}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
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

// Sub-component for Stats
const StatCard = ({ label, value, icon, color, isMono }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className={`text-lg font-bold text-slate-800 ${isMono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  </div>
);

// Sub-component for Status
const StatusBadge = ({ status }) => {
  const isCredited = status === "Credited";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${isCredited
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-amber-50 text-amber-700 border-amber-100"
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isCredited ? "bg-emerald-500" : "bg-amber-500"}`} />
      {status}
    </span>
  );
};

export default PaymentStatus;