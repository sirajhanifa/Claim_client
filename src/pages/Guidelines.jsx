import React from 'react';
import { useParams } from 'react-router-dom';

function Guidelines() {

    const { username } = useParams();
    const userRole = localStorage.getItem('role') ||
        (username === 'fadmin' ? 'finance' : username === 'admin' ? 'admin' : 'staff');

    const adminContent = (
        <>
            <Section title="Dashboard Analytics" icon="📊" id="dashboard">
                <p className="text-slate-600 leading-relaxed mb-6">This section displays the following five categories in box format:</p>
                <div className="grid md:grid-cols-3 gap-4">
                    <InfoCard title="Total Claims" list={['Total number of claims']} color="blue" />
                    <InfoCard title="Pending Claims" list={['Claims not yet submitted to the Finance Section']} color="indigo" />
                    <InfoCard title="Submitted Claims" list={['Claims submitted to the Finance Section']} color="slate" />
                    <InfoCard title="Credited Claims" list={['Claims for which the amount has been credited']} color="green" />
                    <InfoCard title="Awaiting Credit" list={['Claims submitted to the Finance Section but awaiting payment']} color="amber" />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 mt-4">
                    <p><span className="font-bold">Note:</span> Total Claims = Pending Claims + Submitted Claims</p>
                    <p>Submitted Claims = Credited Claims + Awaiting Credit</p>
                    <p className="text-slate-500 text-xs mt-2">These boxes display the current count of claims based on their status.</p>
                </div>
            </Section>

            <Section title="Claim Entry" icon="✍️" id="entry">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Operation Flow</h4>
                            <ol className="space-y-4">
                                {[
                                    { t: 'Step 1', d: 'Select the Claim Type from the dropdown list.' },
                                    { t: 'Step 2', d: 'Enter the staff member\'s mobile number or name to retrieve their details.' },
                                    { t: 'Step 3', d: 'Enter the claim amount.' },
                                    { t: 'Step 4', d: 'Click Save.' }
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
                            <p className="text-xs text-slate-500 italic">The claim entry will then be stored in the system.</p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section title="Claim Reporting & Authorization" icon="📑" id="report">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="border border-slate-200 rounded-xl p-5">
                        <h4 className="font-bold text-slate-800 mb-3 text-sm">Filter Options & Reports</h4>
                        <p className="text-sm text-slate-600">Various reports can be generated using the eight available filter options. Staff claim enquiries can also be viewed here.</p>
                    </div>
                    <div className="bg-blue-600 text-white rounded-xl p-5">
                        <h4 className="font-bold mb-2 text-sm">Claim Submission</h4>
                        <p className="text-sm text-white/90">A grouped claim is formed by combining individual claims that have the same Claim Type, Staff Category, and Bank Type. Multiple grouped claims together constitute a batch, which is sent to the Principal for approval.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <ReportItem title="Unsubmitted" text="Claim bills have been entered into the system." />
                    <ReportItem title="Processed" text="Claim bills have been grouped into batches and are ready for the Principal's approval/signature." highlight />
                    <ReportItem title="Submitted" text="Claim bills have been submitted to the Finance Section." />
                    <ReportItem title="Credited" text="The claim amount has been credited to the staff members." />
                </div>

                <div className="mt-8 bg-amber-50 border border-amber-200 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-600 text-6xl font-bold italic">FLOW</div>
                    <h4 className="text-amber-800 font-extrabold uppercase tracking-widest text-xs mb-4">Status of Claims</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm relative z-10">
                        <div><span className="font-bold">Unsubmitted:</span> Claim bills entered.</div>
                        <div><span className="font-bold">Processed:</span> Grouped & ready for approval.</div>
                        <div><span className="font-bold">Submitted:</span> Sent to Finance Section.</div>
                        <div><span className="font-bold">Credited:</span> Amount credited to staff.</div>
                    </div>
                </div>
            </Section>

            <Section title="Payment Tracking & Finance Processing" icon="💳" id="payment">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                        <p className="text-slate-600 mb-4 font-semibold">Finance Processing (Claim Status)</p>
                        <p className="text-sm text-slate-600">This menu displays the status of each claim batch. The action of submitting a batch to the Finance Section is performed here by clicking the Submit Batch to Finance button.</p>
                        <div className="mt-4 p-4 bg-indigo-50 rounded-xl">
                            <p className="text-sm font-semibold text-indigo-800">Payment Processing (Finance Section)</p>
                            <p className="text-sm text-indigo-700">This section displays the claim batches as viewed by Finance Section staff after logging into the system. It is a replica of the page available in the Finance Section login.</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 w-full md:w-64 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Individual vs Grouped Claim</p>
                        <div className="text-xs space-y-3 text-slate-600">
                            <p><span className="font-bold">Individual Claim:</span> Each claim entry submitted by a staff member for a particular claim type.</p>
                            <p><span className="font-bold">Grouped Claim (Batch):</span> Claims grouped by Claim Type, Staff Category, and Bank Type. A grouped claim is formed by combining individual claims that have the same Claim Type, Staff Category, and Bank Type. Multiple grouped claims together form a batch.</p>
                        </div>
                    </div>
                </div>
            </Section>

            <div className="grid md:grid-cols-2 gap-6">
                <Section title="Staff Management" icon="👥" id="staff">
                    <p className="text-sm text-slate-600 mb-4">Staff details are maintained and managed here.</p>
                    <div className="flex gap-2">
                        <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded font-bold border border-green-200">ADD STAFF</span>
                        <span className="text-[10px] bg-slate-50 text-slate-700 px-2 py-1 rounded font-bold border border-slate-200">BULK EXPORT</span>
                    </div>
                </Section>
                <Section title="Claim Management" icon="⚙️" id="claims">
                    <p className="text-sm text-slate-600">Claim details are maintained and managed here.</p>
                </Section>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <span className="text-blue-600">🔧</span> Core Settings
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-bold text-slate-800">Academic Management</p>
                            <p className="text-xs text-slate-500">Academic periods are maintained here. The academic period is represented as either June–Year or December–Year.</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">User Control</p>
                            <p className="text-xs text-slate-500">Displays the list of system users.</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Change Password</p>
                            <p className="text-xs text-slate-500">Allows the current user to change their password.</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-red-600">Data Deletion</p>
                            <p className="text-xs text-slate-500">Used to delete all claim entry data for a selected academic semester.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <h3 className="font-bold flex items-center gap-2 mb-2 italic">📌 Logout</h3>
                    <p className="text-xs text-indigo-100 leading-relaxed">Logs out the current user from the system.</p>
                </div>
            </div>
        </>
    );

    const financeContent = (
        <>
            <Section title="Dashboard Analytics" icon="📊" id="dashboard">
                <p className="text-slate-600 leading-relaxed mb-6">This section displays the following five categories in box format:</p>
                <div className="grid md:grid-cols-3 gap-4">
                    <InfoCard title="Total Claims" list={['Total number of claims']} color="blue" />
                    <InfoCard title="Pending Claims" list={['Claims not yet submitted to the Finance Section']} color="indigo" />
                    <InfoCard title="Submitted Claims" list={['Claims submitted to the Finance Section']} color="slate" />
                    <InfoCard title="Credited Claims" list={['Claims for which the amount has been credited']} color="green" />
                    <InfoCard title="Awaiting Credit" list={['Claims submitted to the Finance Section but awaiting payment']} color="amber" />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 mt-4">
                    <p><span className="font-bold">Note:</span> Total Claims = Pending Claims + Submitted Claims</p>
                    <p>Submitted Claims = Credited Claims + Awaiting Credit</p>
                    <p className="text-slate-500 text-xs mt-2">These boxes display the current count of claims based on their status.</p>
                </div>
            </Section>

            <Section title="Payment Processing (Finance Section)" icon="💳" id="payment">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                        <p className="text-slate-600 mb-4">This section displays the claim batches as viewed by Finance Section staff after logging into the system. It is a replica of the page available in the Finance Section login.</p>
                        <div className="mt-4 p-4 bg-indigo-50 rounded-xl">
                            <p className="text-sm font-semibold text-indigo-800">Finance Processing (Claim Status)</p>
                            <p className="text-sm text-indigo-700">This menu displays the status of each claim batch. The action of submitting a batch to the Finance Section is performed here by clicking the Submit Batch to Finance button.</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 w-full md:w-64 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Claim Status</p>
                        <div className="text-xs space-y-2 text-slate-600">
                            <p><span className="font-bold">Unsubmitted:</span> Claim bills entered.</p>
                            <p><span className="font-bold">Processed:</span> Grouped & ready for approval.</p>
                            <p><span className="font-bold">Submitted:</span> Sent to Finance Section.</p>
                            <p><span className="font-bold">Credited:</span> Amount credited to staff.</p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section title="Claim Report" icon="📑" id="report">
                <p className="text-slate-600">Various reports can be generated using the eight available filter options. Staff claim enquiries can also be viewed here.</p>
            </Section>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <span className="text-blue-600">🔧</span> Core Settings
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-bold text-slate-800">Change Password</p>
                            <p className="text-xs text-slate-500">Allows the current user to change their password.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <h3 className="font-bold flex items-center gap-2 mb-2 italic">📌 Logout</h3>
                    <p className="text-xs text-indigo-100 leading-relaxed">Logs out the current user from the system.</p>
                </div>
            </div>
        </>
    );

    const staffContent = (
        <>
            <Section title="Dashboard Analytics" icon="📊" id="dashboard">
                <p className="text-slate-600 leading-relaxed mb-6">This section displays the following five categories in box format:</p>
                <div className="grid md:grid-cols-3 gap-4">
                    <InfoCard title="Total Claims" list={['Total number of claims']} color="blue" />
                    <InfoCard title="Pending Claims" list={['Claims not yet submitted to the Finance Section']} color="indigo" />
                    <InfoCard title="Submitted Claims" list={['Claims submitted to the Finance Section']} color="slate" />
                    <InfoCard title="Credited Claims" list={['Claims for which the amount has been credited']} color="green" />
                    <InfoCard title="Awaiting Credit" list={['Claims submitted to the Finance Section but awaiting payment']} color="amber" />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 mt-4">
                    <p><span className="font-bold">Note:</span> Total Claims = Pending Claims + Submitted Claims</p>
                    <p>Submitted Claims = Credited Claims + Awaiting Credit</p>
                    <p className="text-slate-500 text-xs mt-2">These boxes display the current count of claims based on their status.</p>
                </div>
            </Section>

            <Section title="Claim Entry" icon="✍️" id="entry">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Operation Flow</h4>
                            <ol className="space-y-4">
                                {[
                                    { t: 'Step 1', d: 'Select the Claim Type from the dropdown list.' },
                                    { t: 'Step 2', d: 'Enter the staff member\'s mobile number or name to retrieve their details.' },
                                    { t: 'Step 3', d: 'Enter the claim amount.' },
                                    { t: 'Step 4', d: 'Click Save.' }
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
                            <p className="text-xs text-slate-500 italic">The claim entry will then be stored in the system.</p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section title="Claim Submission" icon="📤" id="submission">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <p className="text-slate-700">A grouped claim is formed by combining individual claims that have the same Claim Type, Staff Category, and Bank Type. Multiple grouped claims together constitute a batch, which is sent to the Principal for approval.</p>
                    <div className="mt-4 p-4 bg-white rounded-lg">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Individual vs Grouped Claim</p>
                        <p className="text-xs text-slate-600"><span className="font-bold">Individual Claim:</span> Each claim entry submitted by a staff member for a particular claim type.</p>
                        <p className="text-xs text-slate-600 mt-1"><span className="font-bold">Grouped Claim (Batch):</span> Claims grouped by Claim Type, Staff Category, and Bank Type. A grouped claim is formed by combining individual claims that have the same Claim Type, Staff Category, and Bank Type. Multiple grouped claims together form a batch.</p>
                    </div>
                </div>
            </Section>

            <Section title="Claim Report" icon="📑" id="report">
                <p className="text-slate-600 mb-4">Various reports can be generated using the eight available filter options. Staff claim enquiries can also be viewed here.</p>
                <div className="space-y-4">
                    <ReportItem title="Unsubmitted" text="Claim bills have been entered into the system." />
                    <ReportItem title="Processed" text="Claim bills have been grouped into batches and are ready for the Principal's approval/signature." highlight />
                    <ReportItem title="Submitted" text="Claim bills have been submitted to the Finance Section." />
                    <ReportItem title="Credited" text="The claim amount has been credited to the staff members." />
                </div>
            </Section>

            <div className="grid md:grid-cols-2 gap-6">
                <Section title="Staff Management" icon="👥" id="staff">
                    <p className="text-sm text-slate-600 mb-4">Staff details are maintained and managed here.</p>
                    <div className="flex gap-2">
                        <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded font-bold border border-green-200">VIEW STAFF</span>
                    </div>
                </Section>
                <Section title="Finance Processing" icon="💰" id="finance">
                    <p className="text-sm text-slate-600">This menu displays the status of each claim batch for staff view.</p>
                </Section>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <span className="text-blue-600">🔧</span> Core Settings
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-bold text-slate-800">Change Password</p>
                            <p className="text-xs text-slate-500">Allows the current user to change their password.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <h3 className="font-bold flex items-center gap-2 mb-2 italic">📌 Logout</h3>
                    <p className="text-xs text-indigo-100 leading-relaxed">Logs out the current user from the system.</p>
                </div>
            </div>
        </>
    );

    const guidelinesContent = userRole === 'admin' ? adminContent : (userRole === 'finance' ? financeContent : staffContent);
    const roleLabel = userRole === 'admin' ? 'Administrator' : (userRole === 'finance' ? 'Finance Section' : 'Staff Member');

    return (
        <div className="min-h-screen text-slate-900 font-sans antialiased">
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
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
                        <span className="text-xs font-medium text-slate-300">Role :</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wide">{roleLabel}</span>
                    </div>
                </div>
            </div>

            <div className="mx-auto -mt-7 relative z-20 flex flex-col justify-center items-center">
                {/* Role-based Navigation Menu */}
                <nav className="max-w-5xl flex flex-wrap justify-center gap-2 mb-12 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/20">
                    {userRole === 'admin' && (
                        <>
                            {['Dashboard', 'Entry', 'Report', 'Payment', 'Staff', 'Claims', 'Settings'].map((item, n) => (
                                <a key={n} href={`#${item.toLowerCase()}`} className="px-4 py-2 rounded-xl hover:bg-slate-50 transition-all text-slate-700 text-sm font-semibold">
                                    {item}
                                </a>
                            ))}
                        </>
                    )}
                    {userRole === 'finance' && (
                        <>
                            {['Dashboard', 'Payment', 'Report', 'Settings'].map((item, n) => (
                                <a key={n} href={`#${item.toLowerCase()}`} className="px-4 py-2 rounded-xl hover:bg-slate-50 transition-all text-slate-700 text-sm font-semibold">
                                    {item}
                                </a>
                            ))}
                        </>
                    )}
                    {userRole === 'staff' && (
                        <>
                            {['Dashboard', 'Entry', 'Submission', 'Report', 'Staff', 'Finance', 'Settings'].map((item, n) => (
                                <a key={n} href={`#${item.toLowerCase()}`} className="px-4 py-2 rounded-xl hover:bg-slate-50 transition-all text-slate-700 text-sm font-semibold">
                                    {item}
                                </a>
                            ))}
                        </>
                    )}
                </nav>

                <div className="space-y-10">
                    {guidelinesContent}
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
        slate: "bg-slate-50 text-slate-700 border-slate-100",
        green: "bg-green-50 text-green-700 border-green-100",
        amber: "bg-amber-50 text-amber-700 border-amber-100"
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