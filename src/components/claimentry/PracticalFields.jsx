import React from 'react';

const PracticalFields = ({ form, setForm }) => {
    return (
        <>
            {/* QPS Paper Setting */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">QPS Paper Setting</label>
                <input
                    type="number"
                    value={form.qps_paper_setting || ""}
                    onChange={(e) => setForm({ ...form, qps_paper_setting: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="Enter papers count"
                />
            </div>

            {/* Degree Level (UG / PG) */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Degree Level</label>
                <div className="flex gap-4">
                    {/* UG */}
                    <label className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5 border rounded-xl cursor-pointer transition-all duration-200
                      hover:bg-slate-50
                      has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
                        <input
                            type="radio"
                            value="UG"
                            checked={form.degree_level === "UG"}
                            onChange={(e) => setForm({ ...form, degree_level: e.target.value })}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-slate-700">UG</span>
                    </label>

                    {/* PG */}
                    <label className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5 border rounded-xl cursor-pointer transition-all duration-200
                      hover:bg-slate-50
                      has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
                        <input
                            type="radio"
                            value="PG"
                            checked={form.degree_level === "PG"}
                            onChange={(e) => setForm({ ...form, degree_level: e.target.value })}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-slate-700">PG</span>
                    </label>
                </div>
            </div>

            {/* No. of Students */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">No. of Students</label>
                <input
                    type="number"
                    value={form.total_students || ""}
                    onChange={(e) => setForm({ ...form, total_students: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="Total students count"
                />
            </div>

            {/* No. of Days Halted */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">No. of Days Halted</label>
                <input
                    type="number"
                    value={form.days_halted || ""}
                    onChange={(e) => setForm({ ...form, days_halted: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="Enter days"
                />
            </div>

            {/* Dearness Allowance */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Dearness Allowance (Per Day)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                        type="number"
                        value={form.dearness_allowance || ""}
                        onChange={(e) => setForm({ ...form, dearness_allowance: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Travelling Allowance */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Travelling Allowance</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                        type="number"
                        value={form.travelling_allowance || ""}
                        onChange={(e) => setForm({ ...form, travelling_allowance: e.target.value })}
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Tax Type Dropdown */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Tax Type</label>
                <select
                    value={form.tax_type || ""}
                    onChange={(e) => setForm({ ...form, tax_type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer font-medium text-slate-900"
                >
                    <option value="">Select Tax Type</option>
                    <option value="Aided">TDS</option>
                    <option value="SF">NO TDS</option>
                </select>
            </div>

            {form.tax_type === "Aided" && (
                <>
                    <div className="flex flex-col space-y-3">
                        <label className="text-sm font-bold text-slate-700 ml-1">Total Value</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                type="text"
                                value={form.practical_total_value || ""}
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
                                value={form.practical_calculated_tds !== undefined ? form.practical_calculated_tds : ""}
                                onChange={(e) => {
                                    const newTds = e.target.value;
                                    setForm(prev => ({
                                        ...prev,
                                        practical_calculated_tds: newTds,
                                        amount: Math.max(Number(prev.practical_total_value || 0) - Number(newTds || 0), 0).toString()
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

export default PracticalFields;