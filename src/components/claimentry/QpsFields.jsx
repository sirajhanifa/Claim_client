import React from 'react';

const QpsFields = ({ form, setForm }) => {
    return (
        <>
            {/* No. of UG QPS */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">No. of UG QPS</label>
                <input
                    type="number"
                    value={form.no_of_qps_ug || ""}
                    onChange={(e) => setForm({ ...form, no_of_qps_ug: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="e.g. 5"
                />
            </div>

            {/* No. of PG QPS */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">No. of PG QPS</label>
                <input
                    type="number"
                    value={form.no_of_qps_pg || ""}
                    onChange={(e) => setForm({ ...form, no_of_qps_pg: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="e.g. 2"
                />
            </div>

            {/* No. of Scheme */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">No. of Scheme</label>
                <input
                    type="number"
                    value={form.no_of_scheme || ""}
                    onChange={(e) => setForm({ ...form, no_of_scheme: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-900"
                    placeholder="Enter schemes count"
                />
            </div>
        </>
    );
};

export default QpsFields;