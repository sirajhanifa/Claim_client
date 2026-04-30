import React from 'react';

const CentralValuation = ({ form, setForm }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <>
            {/* Role */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">
                    Chairman / Examiner
                </label>
                <select
                    name="central_role"
                    value={form.central_role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer font-medium text-slate-900"
                >
                    <option value="">Select Role</option>
                    <option value="Chairman">Chairman</option>
                    <option value="Examiner">Examiner</option>
                </select>
            </div>

            {/* UG Scripts */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">
                    Total UG Scripts
                </label>
                <input
                    type="number"
                    name="central_total_scripts_ug"
                    value={form.central_total_scripts_ug}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="Enter UG scripts"
                />
            </div>

            {/* PG Scripts */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">
                    Total PG Scripts
                </label>
                <input
                    type="number"
                    name="central_total_scripts_pg"
                    value={form.central_total_scripts_pg}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="Enter PG scripts"
                />
            </div>

            {/* Halt Days */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">
                    No. of Days Halted
                </label>
                <input
                    type="number"
                    name="central_days_halted"
                    value={form.central_days_halted}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="0"
                />
            </div>

            {/* Dearness Allowance */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">
                    Dearness Allowance (per day)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                        type="number"
                        name="central_dearness_allowance"
                        value={form.central_dearness_allowance || ''}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Travel Allowance */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">
                    Travel Allowance
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                        type="number"
                        name="central_travel_allowance"
                        value={form.central_travel_allowance}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Tax */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">
                    Tax Type
                </label>
                <select
                    name="central_tax_applicable"
                    value={form.central_tax_applicable}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer font-medium text-slate-900"
                >
                    <option value="">Select Tax Type</option>
                    <option value="AIDED">TDS</option>
                    <option value="SF">NO TDS</option>
                </select>
            </div>

            {form.central_tax_applicable === "AIDED" && (
                <>
                    <div className="flex flex-col space-y-3">
                        <label className="text-sm font-bold text-slate-700 ml-1">Total Value</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                type="text"
                                value={form.central_total_value || ""}
                                readOnly
                                className="w-full pl-8 pr-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-bold text-slate-900 cursor-not-allowed"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <label className="text-sm font-bold text-slate-700 ml-1">Calculated TDS</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                type="number"
                                value={form.central_calculated_tds !== undefined ? form.central_calculated_tds : ""}
                                onChange={(e) => {
                                    const newTds = e.target.value;
                                    setForm(prev => ({
                                        ...prev,
                                        central_calculated_tds: newTds,
                                        amount: Math.max(Number(prev.central_total_value || 0) - Number(newTds || 0), 0).toString()
                                    }));
                                }}
                                className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default CentralValuation;