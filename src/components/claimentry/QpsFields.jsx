// components/claimTypes/QpsFields.jsx
import React from 'react';

const QpsFields = ({ form, setForm }) => {
  return (
    <>
      {/* No. of UG QPS */}
      <div>
        <label className="text-sm font-semibold text-gray-700">No. of UG QPS</label>
        <input
          type="number"
          value={form.no_of_qps_ug}
          onChange={(e) => setForm({ ...form, no_of_qps_ug: e.target.value })}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter UG QPS count"
        />
      </div>

      {/* No. of PG QPS */}
      <div>
        <label className="text-sm font-semibold text-gray-700">No. of PG QPS</label>
        <input
          type="number"
          value={form.no_of_qps_pg}
          onChange={(e) => setForm({ ...form, no_of_qps_pg: e.target.value })}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter PG QPS count"
        />
      </div>

      {/* No. of Scheme */}
      <div>
        <label className="text-sm font-semibold text-gray-700">No. of Scheme</label>
        <input
          type="number"
          value={form.no_of_scheme}
          onChange={(e) => setForm({ ...form, no_of_scheme: e.target.value })}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter number of schemes"
        />
      </div>

    </>
  );
};

export default QpsFields;
