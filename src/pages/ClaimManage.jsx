import React, { useState, useMemo } from 'react';
import Button from '../components/Button';
import { Plus, Trash, Pencil, Eye, EyeOff, X, AlertTriangle, Search } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import usePost from '../hooks/usePost';
import useDelete from '../hooks/useDelete';

const ClaimManage = () => {

    const apiUrl = import.meta.env.VITE_API_URL;
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [confirmDeleteClaim, setConfirmDeleteClaim] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredData = useMemo(() => {
        if (!data) return [];
        const term = searchTerm.toLowerCase();
        return data.filter(claim =>
            claim.claim_type_name.toLowerCase().includes(term) ||
            claim.description?.toLowerCase().includes(term) ||
            Object.values(claim.amount_settings || {}).some(val => String(val).includes(term))
        );
    }, [data, searchTerm]);

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

    const handleDelete = async () => {
        if (!confirmDeleteClaim) return;
        await deleteData(`${apiUrl}/api/deleteClaim/${confirmDeleteClaim._id}`);
        refetch();
        setConfirmDeleteClaim(null);
    };

    const handleToggleActive = async (claim) => {
        const newActiveStatus = !claim.isActive;
        await postData(`${apiUrl}/api/updateClaim/${claim._id}`, { isActive: newActiveStatus });
        refetch();
    };

    const hasAnyRate = (settings) => {
        if (!settings) return false;
        return Object.values(settings).some(val => val !== '' && val !== null && val !== undefined);
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        <div className="h-1 w-8 bg-blue-600 rounded-full" />
                        System Configuration
                    </div>
                    <h1 className="text-4xl xl:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Claim <span className="text-slate-400 font-light">Categories</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl w-78 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <Button
                        variant="primary"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 whitespace-nowrap"
                        onClick={() => {
                            resetForm();
                            setEditingId(null);
                            setShowModal(true);
                        }}
                    >
                        <Plus size={20} />
                        <span>Add Category</span>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative">
                {loading && (
                    <div className="flex items-center gap-3 text-sm font-bold text-blue-700 mb-6 bg-blue-100/50 w-fit px-5 py-2.5 rounded-full border border-blue-200 animate-pulse">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                        SYNCING REGISTRY...
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredData && filteredData.length > 0 ? (
                        filteredData.map((claim, index) => (
                            <div
                                key={claim._id}
                                className={`group bg-white rounded-2xl border-2 transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-blue-900/5 ${claim.isActive ? 'border-slate-100 hover:border-blue-400' : 'border-slate-200 opacity-80'
                                    }`}
                            >
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start mb-5">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg border ${claim.isActive
                                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                                            : 'bg-slate-100 text-slate-400 border-slate-200'
                                            }`}>
                                            Category #{index + 1}
                                        </span>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleToggleActive(claim)}
                                                className={`p-2.5 rounded-lg transition-all shadow-sm ${claim.isActive
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-slate-200 text-slate-500 hover:bg-blue-500 hover:text-white'
                                                    }`}
                                                title={claim.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {claim.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(claim)}
                                                className="p-2.5 bg-white text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteClaim(claim)}
                                                className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-4 leading-tight group-hover:text-blue-700 transition-colors">
                                        {claim.claim_type_name}
                                    </h3>

                                    {/* Pricing List */}
                                    <div className="space-y-2.5">
                                        <p className="text-[15px] font-semibold text-blue-500 mb-4 ml-1">Current Pricing</p>
                                        {hasAnyRate(claim.amount_settings) ? (
                                            Object.entries(claim.amount_settings).map(([key, val]) => (
                                                val !== '' && val !== null && val !== undefined && (
                                                    <div key={key} className="flex justify-between items-center bg-blue-50/40 p-3 rounded-xl border border-blue-100/50 group-hover:bg-white group-hover:border-blue-200 transition-all">
                                                        <span className="text-[13px] font-bold uppercase text-slate-500">
                                                            {key.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="text-sm font-black text-blue-700">
                                                            ₹{val.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                )
                                            ))
                                        ) : (
                                            <div className="text-center py-4 bg-amber-50 rounded-xl border-2 border-dashed border-amber-200 text-amber-600 text-xs font-bold uppercase tracking-widest">
                                                Not Configured
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-blue-200 shadow-inner shadow-blue-50">
                            <p className="text-blue-400 font-bold text-lg tracking-tight">The registry is currently empty.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 leading-none">
                                    {editingId ? 'Edit Category' : 'New Category'}
                                </h2>
                                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">Configuration Panel</p>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); setEditingId(null); }}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <form onSubmit={handleSubmit} id="type-form" className="space-y-5">
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            Category Title :
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Examination Duties"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            Description :
                                        </label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="Details regarding this claim type..."
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-1 w-4 bg-blue-600 rounded-full" />
                                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Rate Schedule (₹)</h3>
                                    </div>
                                    {hasAnyRate(form.amount_settings) ? (
                                        <div className="grid grid-cols-3 gap-6">
                                            {Object.entries(form.amount_settings).map(([key, value]) => (
                                                <div key={key} className="space-y-3">
                                                    <label className="text-[12px] font-bold text-slate-500 uppercase block ml-1">
                                                        {key.replace(/_/g, ' ')} :
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-xs">₹</span>
                                                        <input
                                                            type="number"
                                                            name={key}
                                                            value={value}
                                                            onChange={handleAmountChange}
                                                            onWheel={(e) => e.target.blur()}
                                                            className="w-full bg-white border border-blue-100 rounded-lg pl-6 pr-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-white/60 rounded-xl border-2 border-dashed border-blue-200">
                                            <p className="text-blue-500 font-bold text-sm uppercase tracking-wider">No pricing configured</p>
                                            <p className="text-xs text-slate-400 mt-1">Add rates above by filling the fields</p>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Footer buttons: equal width (1/2 each) */}
                        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setShowModal(false); setEditingId(null); }}
                                className="flex-1 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                form="type-form"
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                            >
                                {editingId ? 'Save Changes' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Redesigned Delete Modal */}
            {confirmDeleteClaim && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-red-600 p-8 text-white flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-lg">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-2xl font-bold">Irreversible Action</h3>
                            <p className="text-red-100 text-sm mt-2">You are about to delete all claim data for:</p>
                            <div className="px-4 py-2 bg-black/10 rounded-lg font-bold text-2xl border border-white/20 mt-2">
                                {confirmDeleteClaim.claim_type_name}
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <p className="text-slate-600 text-center text-sm leading-relaxed">
                                Proceeding will remove every claim entry associated with this semester from the live database. This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDeleteClaim(null)}
                                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all active:scale-95"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimManage;