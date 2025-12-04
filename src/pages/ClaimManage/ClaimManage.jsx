import React, { useState } from 'react';
import Button from '../../components/Button';
import { Plus, Trash, Pencil } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import usePost from '../../hooks/usePost';
import useDelete from '../../hooks/useDelete';

const ClaimManage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    amount_settings: {
      scrutiny_ug_rate: '',
      scrutiny_pg_rate: '',
      scrutiny_day_rate: '',
      qps_rate: '',
      cia_rate: ''
    }
  });

  const { data, loading, error, refetch } = useFetch(`${apiUrl}/api/getClaim`);
  const { postData } = usePost();
  const { deleteData } = useDelete();

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      amount_settings: {
        scrutiny_ug_rate: '',
        scrutiny_pg_rate: '',
        scrutiny_day_rate: '',
        qps_rate: '',
        cia_rate: ''
      }
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAmountChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      amount_settings: { ...prev.amount_settings, [name]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editingId
      ? `${apiUrl}/api/updateClaim/${editingId}`
      : `${apiUrl}/api/addclaim`;

    const payload = editingId
      ? form
      : { name: form.name, description: form.description };

    await postData(endpoint, payload);
    refetch();
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (claim) => {
    setForm({
      name: claim.claim_type_name,
      description: claim.description,
      amount_settings: claim.amount_settings || {}
    });
    setEditingId(claim._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await deleteData(`${apiUrl}/api/deleteClaim/${id}`);
    refetch();
    setConfirmDeleteId(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-900 tracking-tight">
          🎯 Claim Types
        </h2>
        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowModal(true);
          }}
        >
          Add Claim
        </Button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="text-blue-600 font-medium animate-pulse">
          Loading claim types...
        </div>
      )}
      {error && (
        <p className="text-red-600 font-medium">
          Failed to load claim types. Try again!
        </p>
      )}

      {/* Claim Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data && data.length > 0 ? (
          data.map((claim, index) => (
            <div
              key={claim._id}
              className="bg-white rounded-xl border border-gray-200 shadow hover:shadow-lg transition-all duration-300 p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 px-3 py-1 text-xs rounded-bl-xl font-semibold">
                #{index + 1}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {claim.claim_type_name}
              </h3>

              <p className="text-sm text-gray-600 mb-3">
                {claim.description || 'No description'}
              </p>

              <div className="space-y-1 text-sm">
                {claim.amount_settings ? (
                  Object.entries(claim.amount_settings).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium capitalize text-gray-700">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-semibold text-blue-700">
                        ₹{val}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No amount settings</span>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                {/* Edit Button */}
                <button
                  className="px-3 py-1.5 text-sm rounded-md flex items-center gap-1
               bg-blue-600 text-white border
               hover:bg-blue-700 font-bold transition"
                  onClick={() => handleEdit(claim)}
                >
                  <Pencil size={15} /> Edit
                </button>

                {/* Delete Button */}
                <button
                  className="px-3 py-1.5 text-sm rounded-md flex items-center gap-1
               bg-red-600 text-white
               hover:bg-red-700 font-bold transition"
                  onClick={() => setConfirmDeleteId(claim._id)}
                >
                  <Trash size={15} /> Delete
                </button>
              </div>

            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">
            No claim types found.
          </p>
        )}
      </div>

      {/* Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm animate-fadeIn">
            <h2 className="text-lg font-semibold mb-3">
              Confirm Delete
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this claim type?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border bg-blue-600 font-bold hover:bg-blue-700 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md animate-slideUp">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {editingId ? 'Edit Claim Type' : 'Add New Claim Type'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              {/* Amount Settings */}
              {editingId && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Amount Settings
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {Object.entries(form.amount_settings).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-xs font-medium text-gray-600">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </label>
                        <input
                          type="number"
                          name={key}
                          value={value}
                          onChange={handleAmountChange}
                          className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimManage;
