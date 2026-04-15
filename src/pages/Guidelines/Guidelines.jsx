import React from 'react';

function Guidelines() {
    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased pb-20">
            {/* Professional Hero Header */}
            <div className="bg-[#0f172a] text-white pt-16 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-widest uppercase mb-4">
                        Documentation Portal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Claim Management System
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Your complete operational manual for workflows, role permissions, and integrated financial navigation.
                    </p>
                </div>
            </div>

            <div className="mx-auto -mt-12 relative z-20 flex flex-col justify-center items-center">
                {/* Modern Navigation Menu */}
                <nav className="max-w-5xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-2 mb-12 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/20">
                    {['Dashboard', 'Entry', 'Report', 'Payment', 'Staff', 'Claims', 'Settings', 'Guide', 'Logout'].map((item, n) => (
                        <a
                            key={n}
                            href={`#${item.toLowerCase()}`}
                            className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                        >
                            <span className="text-slate-400 text-xs font-bold mb-1 group-hover:text-blue-600 uppercase tracking-tighter">{n + 1}</span>
                            <span className="text-slate-700 text-[13px] font-semibold">{item}</span>
                        </a>
                    ))}
                </nav>

                <div className="space-y-10">
                    {/* Dashboard Section */}
                    <Section title="Dashboard Analytics" icon="📊" id="dashboard">
                        <p className="text-slate-600 leading-relaxed mb-6">The Dashboard centralizes key performance indicators into three strategic analytical layers.</p>
                        <div className="grid md:grid-cols-3 gap-4">
                            <InfoCard title="Claim Summaries" list={['Total Claims', 'Unsubmitted', 'Submitted', 'Sanctioned', 'Awaiting Credit']} color="blue" />
                            <InfoCard title="Type Analysis" desc="Visual bar distribution categorized by claim classifications." color="indigo" />
                            <InfoCard title="Staff Metrics" desc="Dual pie-charts comparing Internal vs External headcount and payout ratios." color="slate" />
                        </div>
                    </Section>

                    {/* Claim Entry Section */}
                    <Section title="Claim Entry" icon="✍️" id="entry">
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Process Workflow</h4>
                                    <ol className="space-y-4">
                                        {[
                                            { t: 'Classification', d: 'Select the Claim Type from the verified dropdown.' },
                                            { t: 'Identification', d: 'Input mobile number to auto-populate staff data.' },
                                            { t: 'Valuation', d: 'Enter the specific claim amount requested.' },
                                            { t: 'Finalization', d: 'Commit the record via the Save button.' }
                                        ].map((step, i) => (
                                            <li key={i} className="flex gap-4">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm leading-none">{step.t}</p>
                                                    <p className="text-slate-500 text-sm mt-1">{step.d}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                                <div className="md:w-1/3 bg-white p-4 rounded-lg shadow-sm border border-slate-200 self-center">
                                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> System Ready
                                    </div>
                                    <p className="text-xs text-slate-500 italic">Data is automatically indexed and encrypted upon submission.</p>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Claim Report Section */}
                    <Section title="Claim Reporting & Authorization" icon="📑" id="report">
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="border border-slate-200 rounded-xl p-5">
                                <h4 className="font-bold text-slate-800 mb-3 text-sm">Dynamic Filters</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['Claim Type', 'Staff Category', 'Bank Type', 'Entry Date'].map(tag => (
                                        <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-semibold">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-blue-600 text-white rounded-xl p-5">
                                <h4 className="font-bold mb-2 text-sm">Action Toolbar</h4>
                                <div className="flex gap-2">
                                    <div className="bg-white/20 px-3 py-2 rounded text-[11px] font-bold border border-white/10 uppercase">PDF Export</div>
                                    <div className="bg-white/20 px-3 py-2 rounded text-[11px] font-bold border border-white/10 uppercase">Excel Sync</div>
                                    <div className="bg-white px-3 py-2 rounded text-[11px] font-bold text-blue-600 uppercase">Submit Claim</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ReportItem title="3.1 Total Claims" text="Master ledger of all entries (Raw Data)." />
                            <ReportItem title="3.2 Unsubmitted" text="Authorization queue for Secretary & Principal review." highlight />
                            <ReportItem title="3.3 Submitted" text="Validated records currently in process." />
                            <ReportItem title="3.4 Credited" text="Historical archive of successfully disbursed funds." />
                        </div>

                        <div className="mt-8 bg-amber-50 border border-amber-200 p-6 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-600 text-6xl font-bold italic">FLOW</div>
                            <h4 className="text-amber-800 font-extrabold uppercase tracking-widest text-xs mb-4">The Token Generation Pipeline</h4>
                            <p className="text-amber-900/80 font-mono text-sm leading-relaxed relative z-10">
                                Entry → Unsubmitted → Excel Export → Signature → Submit → Token → Finance → Credit
                            </p>
                        </div>
                    </Section>

                    {/* Payment Status Section */}
                    <Section title="Payment Tracking" icon="💳" id="payment">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1">
                                <p className="text-slate-600 mb-4">Monitors the lifecycle of financial tokens post-submission.</p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-sm text-slate-700">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span> <strong>Credited:</strong> Transaction complete.
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-700">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> <strong>Pending:</strong> Awaiting bank processing.
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 w-full md:w-64 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Token Metadata</p>
                                <div className="text-xs space-y-2 text-slate-500">
                                    <p>• Staff Identification</p>
                                    <p>• Claim Classification</p>
                                    <p>• Value & Submission Date</p>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Quick Grid for Remaining Sections */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Section title="Staff Management" icon="👥" id="staff">
                            <p className="text-sm text-slate-600 mb-4">Control center for Department, Designation, and Employment Type management.</p>
                            <div className="flex gap-2">
                                <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded font-bold border border-green-200">ADD STAFF</span>
                                <span className="text-[10px] bg-slate-50 text-slate-700 px-2 py-1 rounded font-bold border border-slate-200">BULK EXPORT</span>
                            </div>
                        </Section>
                        <Section title="Claim Configuration" icon="⚙️" id="claims">
                            <p className="text-sm text-slate-600">Administer master claim types, editing existing structures or removing redundant categories.</p>
                        </Section>
                    </div>

                    {/* System Settings & Footer info */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <span className="text-blue-600">🔧</span> Core Settings
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">User Control</p>
                                    <p className="text-xs text-slate-500">Provision roles and manage access credentials.</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-red-600">Database Purge</p>
                                    <p className="text-xs text-slate-500">Permanent removal of historical records.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
                            <h3 className="font-bold flex items-center gap-2 mb-2 italic">📌 Pro-Tip</h3>
                            <p className="text-xs text-indigo-100 leading-relaxed">
                                Use the "Grouped Record" logic to process multiple claims for a single staff member in one signature cycle.
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="mt-20 py-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                        CMS Framework © 2026
                    </p>
                    <div className="flex gap-6">
                        <span className="text-slate-400 text-xs">V1.0.4 - Enterprise Edition</span>
                        <span className="text-blue-600 text-xs font-bold underline cursor-pointer">Support Portal</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

// --- Specialized Internal Components ---

const Section = ({ title, icon, id, children }) => (
    <section id={id} className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden scroll-mt-24">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-4">
            <span className="text-2xl">{icon}</span>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
        </div>
        <div className="p-8">
            {children}
        </div>
    </section>
);

const InfoCard = ({ title, list, desc, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
        slate: "bg-slate-50 text-slate-700 border-slate-100"
    };
    return (
        <div className={`p-5 rounded-2xl border ${colors[color]} h-full`}>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wide opacity-80">{title}</h4>
            {list ? (
                <ul className="text-xs space-y-2 font-semibold">
                    {list.map(i => <li key={i} className="flex items-center gap-2">● {i}</li>)}
                </ul>
            ) : <p className="text-xs font-medium leading-relaxed">{desc}</p>}
        </div>
    );
};

const ReportItem = ({ title, text, highlight }) => (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${highlight ? 'bg-blue-50/50 border-blue-200' : 'border-slate-100'}`}>
        <div>
            <h5 className={`text-sm font-bold ${highlight ? 'text-blue-900' : 'text-slate-800'}`}>{title}</h5>
            <p className="text-xs text-slate-500 mt-0.5">{text}</p>
        </div>
        <div className="h-2 w-2 rounded-full bg-slate-300"></div>
    </div>
);

export default Guidelines;