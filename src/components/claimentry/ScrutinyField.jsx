import React from 'react';

const ScrutinyField = ({ form, setForm }) => {
    return (
        <>
            {/* No. of UG Papers */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">No. of UG Papers</label>
                <input
                    type="number"
                    value={form.no_of_ug_papers || ""}
                    onChange={(e) => setForm({ ...form, no_of_ug_papers: e.target.value })}
                    onWheel={(e) => e.target.blur()}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="e.g. 5"
                />
            </div>

            {/* No. of PG Papers */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">No. of PG Papers</label>
                <input
                    type="number"
                    value={form.no_of_pg_papers || ""}
                    onChange={(e) => setForm({ ...form, no_of_pg_papers: e.target.value })}
                    onWheel={(e) => e.target.blur()}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="e.g. 2"
                />
            </div>

            {/* Scrutiny Days */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Scrutiny Days</label>
                <input
                    type="number"
                    value={form.scrutiny_days || ""}
                    onChange={(e) => setForm({ ...form, scrutiny_days: e.target.value })}
                    onWheel={(e) => e.target.blur()}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="Enter days"
                />
            </div>
        </>
    );
};

export default ScrutinyField;