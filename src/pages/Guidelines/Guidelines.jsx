import React from 'react';

function Guidelines() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl shadow-xl p-6 mb-8 text-white">
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                        <span>📘</span> Claim Management System
                    </h1>
                    <p className="text-blue-100 mt-2 text-lg">Complete operational guidelines – workflows, roles, and system navigation</p>
                </div>

                {/* Quick menu badges */}
                <div className="flex flex-wrap gap-2 mb-8 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <span key={n} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                            {n}. {['Dashboard', 'Claim Entry', 'Claim Report', 'Payment Status', 'Staff Manage', 'Claim Manage', 'Settings', 'Guidelines', 'Logout'][n - 1]}
                        </span>
                    ))}
                </div>

                {/* Main content */}
                <div className="space-y-8">
                    {/* Dashboard */}
                    <Section title="📊 1. Dashboard" id="dashboard">
                        <p className="text-gray-700 mb-3">The Dashboard contains 3 main divisions for real-time analytics.</p>
                        <div className="space-y-4">
                            <SubSection title="First Division – Claim Summary Boxes">
                                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                    <li><strong>Total Claims</strong> – overall count</li>
                                    <li><strong>Unsubmitted Claims</strong> – not yet authorized</li>
                                    <li><strong>Submitted Claims</strong> – sent for processing</li>
                                    <li><strong>Sanctioned Claims</strong> – approved</li>
                                    <li><strong>Awaiting for Credit</strong> – pending finance</li>
                                </ul>
                                <p className="text-sm text-gray-500 mt-2">These boxes display current counts based on claim status.</p>
                            </SubSection>
                            <SubSection title="Second Division – Claim Type Analysis">
                                <p>Bar chart showing distribution across various claim types.</p>
                            </SubSection>
                            <SubSection title="Third Division – Staff and Amount Analysis">
                                <p>• Pie chart: number of Internal vs External staff members.<br />• Pie chart: amount received by Internal vs External staff.</p>
                            </SubSection>
                        </div>
                    </Section>

                    {/* Claim Entry */}
                    <Section title="✍️ 2. Claim Entry" id="claim-entry">
                        <p className="font-semibold text-gray-800">Operation Flow:</p>
                        <ol className="list-decimal pl-6 mt-2 space-y-1 text-gray-700">
                            <li>Select the <code className="bg-gray-100 px-1 rounded">Claim Type</code> from the dropdown.</li>
                            <li>Type the <code className="bg-gray-100 px-1 rounded">mobile number</code> to retrieve staff details.</li>
                            <li>Type the claim amount.</li>
                            <li>Click <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Save</span>.</li>
                        </ol>
                        <p className="mt-2 text-green-700">✅ The claim entry is then stored in the system.</p>
                    </Section>

                    {/* Claim Report */}
                    <Section title="📑 3. Claim Report" id="claim-report">
                        <p>Displays claim records based on filters. Search option available.</p>
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                            <p className="font-medium">Filter Options:</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {['Claim Type', 'Staff Category (Internal/External)', 'Bank Type (IOB JMC / IOB / Other Banks)', 'Entry Date'].map(f => (
                                    <span key={f} className="bg-white border px-3 py-1 rounded-full text-sm shadow-sm">{f}</span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 space-y-3">
                            <SubSection title="3.1 Total Claims">
                                <p>All entered claims (ungrouped). <em className="text-gray-500">Grouping reference: by Claim Type, Staff Category, Bank Type → one grouped record per staff member + claim type.</em></p>
                            </SubSection>
                            <SubSection title="3.2 Unsubmitted Claims">
                                <p>Claims not yet authorized by Secretary & Principal. Bottom buttons: <span className="inline-flex gap-2 mt-1"><span className="bg-gray-200 px-2 py-0.5 rounded text-sm">📄 Download PDF</span><span className="bg-gray-200 px-2 py-0.5 rounded text-sm">📎 Export Excel</span><span className="bg-blue-600 text-white px-2 py-0.5 rounded text-sm">Submit Claim</span></span></p>
                                <div className="bg-blue-50 p-3 rounded-lg mt-2">
                                    <p className="font-medium">🔁 Operation Flow & Token Generation:</p>
                                    <ol className="list-decimal pl-5 text-sm space-y-1">
                                        <li>Click <strong>Export Excel</strong> → generate signature copy (system groups claims by Claim Type, Staff Category, Bank Type).</li>
                                        <li>Obtain required signatures.</li>
                                        <li>Click <strong>Submit Claim</strong> → a token button (displaying number of grouped claims) is generated automatically.</li>
                                        <li>Token appears in Finance Section. Finance clicks <strong>Credited</strong> (single record) → record disappears; <strong>Credit All</strong> → entire token disappears.</li>
                                    </ol>
                                </div>
                            </SubSection>
                            <SubSection title="3.3 Submitted Claims">
                                <p>All submitted claims (ungrouped).</p>
                            </SubSection>
                            <SubSection title="3.4 Credited">
                                <p>All claims with credited date (ungrouped).</p>
                            </SubSection>
                        </div>
                        <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
                            <p className="font-medium">⚡ Quick Workflow Summary</p>
                            <p className="font-mono text-sm">Claim Entry → Unsubmitted Claims → Export Excel → Signature → Submit Claim → Token Generation → Finance Processing → Credited</p>
                        </div>
                    </Section>

                    {/* Payment Status */}
                    <Section title="💳 4. Payment Status" id="payment-status">
                        <p>All tokens generated after <strong>Submit Claim</strong> are displayed here.</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Status: <span className="text-green-600">Credited</span> or <span className="text-yellow-700">Pending</span>.</li>
                            <li>Click a token → shows <strong>Staff Detail | Claim Type | Amount | Date of Submission & Credit</strong>.</li>
                            <li>Search option available.</li>
                        </ul>
                    </Section>

                    {/* Staff Manage */}
                    <Section title="👥 5. Staff Manage" id="staff-manage">
                        <p>Three dropdown filters: <strong>Department</strong>, <strong>Designation</strong>, <strong>Employment Type</strong>.</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Staff records displayed based on selections.</li>
                            <li>Action field: Edit / Delete.</li>
                            <li>Buttons: <span className="bg-green-100 px-2 py-0.5 rounded">➕ Add Staff</span> (individual), <span className="bg-gray-100 px-2 py-0.5 rounded">📎 Export Staff</span> (download list).</li>
                            <li>Search option available.</li>
                        </ul>
                    </Section>

                    {/* Claim Manage */}
                    <Section title="⚙️ 6. Claim Manage" id="claim-manage">
                        <p>Manage claim master details – addition, editing, deletion of claim types and related configurations.</p>
                    </Section>

                    {/* Settings */}
                    <Section title="🔧 7. Settings" id="settings">
                        <div className="space-y-2">
                            <p><span className="font-semibold">1. Add User</span> – Create new system users and delete existing users.</p>
                            <p><span className="font-semibold">2. Delete Claim</span> – Permanently delete obsolete claims to free database space.</p>
                        </div>
                    </Section>

                    {/* Guidelines */}
                    <Section title="📖 8. Guidelines" id="guidelines">
                        <p>This menu displays the complete operational guidelines of the Claim Management System (the page you are viewing).</p>
                    </Section>

                    {/* Logout */}
                    <Section title="🚪 9. Logout" id="logout">
                        <p>Securely exit the Claim Management System. Always use this option to end your session.</p>
                    </Section>

                    {/* Extra clarification card */}
                    <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
                        <h3 className="text-lg font-semibold text-indigo-800 flex items-center gap-2">📌 Key Operational Clarifications</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-indigo-900">
                            <li><strong>Grouping logic:</strong> Before Export Excel in Unsubmitted Claims, system groups by Claim Type + Staff Category + Bank Type.</li>
                            <li><strong>Token behavior:</strong> Shows grouped count. Finance crediting removes records individually or all at once.</li>
                            <li><strong>Ungrouped views:</strong> Total Claims, Submitted Claims, Credited show raw entries.</li>
                            <li><strong>Payment Status:</strong> Tokens only; click to see details.</li>
                            <li><strong>Staff Manage:</strong> Dynamic filtering and bulk export.</li>
                            <li><strong>Delete Claim:</strong> Irreversible cleanup.</li>
                        </ul>
                    </div>
                </div>

                <footer className="mt-10 text-center text-gray-400 text-sm border-t pt-6">
                    Claim Management System — Official Guidelines | Version 1.0
                </footer>
            </div>
        </div>
    );
}

// Helper components for consistent styling
const Section = ({ title, id, children }) => (
    <section id={id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 scroll-mt-20">
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-4">{title}</h2>
        {children}
    </section>
);

const SubSection = ({ title, children }) => (
    <div className="mt-3">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <div className="ml-4 mt-1">{children}</div>
    </div>
);

export default Guidelines;