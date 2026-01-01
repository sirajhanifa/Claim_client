import React, { useState } from "react";
import axios from "axios";

const AdminYearDelete = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleDelete = async () => {
    if (!year) {
      alert("Enter year");
      return;
    }

    const confirm = window.confirm(
      `⚠️ Are you sure you want to DELETE all claims for year ${year}?`
    );
    if (!confirm) return;

    setLoading(true);
    setMsg("");

    try {
      const res = await axios.delete(
        `${API_URL}/api/admin/maintenance/delete-year/${year}`
      );

      setMsg(res.data.message);
    } catch (err) {
      setMsg("Failed to delete data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-white shadow-lg rounded-xl p-6 border">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        ⚠️ Delete Year-Wise Claim Data
      </h2>

      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Enter Year (Example: 2025)
      </label>

      <input
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-red-400"
        placeholder="2025"
      />

      <button
        onClick={handleDelete}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition"
      >
        {loading ? "Deleting..." : "Delete Year Data"}
      </button>

      {msg && (
        <p className="mt-4 text-sm font-semibold text-gray-700">
          {msg}
        </p>
      )}
    </div>
  );
};

export default AdminYearDelete;
