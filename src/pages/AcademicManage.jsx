import React, { useState } from 'react';
import { GraduationCap, Calendar, Clock, CheckCircle2, XCircle, Trash2, Edit3, AlertCircle, Loader2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import usePost from '../hooks/usePost';
import usePut from '../hooks/usePut';
import useDelete from '../hooks/useDelete';

const AcademicManage = () => {

    const apiUrl = import.meta.env.VITE_API_URL;
    const [openModal, setOpenModal] = useState(false);
    const [editingAcademic, setEditingAcademic] = useState(null);
    const [formData, setFormData] = useState({
        academic_sem_label: '',
        academic_sem_type: 'Odd',
        academic_year: '',
        active_sem: false
    });

    const { data: academics = [], refetch, loading: fetchLoading } = useFetch(`${apiUrl}/api/getAcademic`);
    const { postData, loading: postLoading, error: postError } = usePost();
    const { putData, loading: putLoading, error: putError } = usePut();
    const { deleteData, loading: deleteLoading } = useDelete();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const closeModal = () => {
        setOpenModal(false);
        setEditingAcademic(null);
        setFormData({
            academic_sem_label: '',
            academic_sem_type: 'Odd',
            academic_year: '',
            active_sem: false
        });
    };

    const handleEdit = (academic) => {
        setEditingAcademic(academic);
        setFormData({
            academic_sem_label: academic.academic_sem_label || '',
            academic_sem_type: academic.academic_sem_type || 'Odd',
            academic_year: academic.academic_year || '',
            active_sem: academic.active_sem || false
        });
        setOpenModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let res;
        if (editingAcademic) {
            res = await putData(`${apiUrl}/api/updateAcademic/${editingAcademic._id}`, formData);
        } else {
            res = await postData(`${apiUrl}/api/addAcademic`, formData);
        }
        if (res) {
            closeModal();
            if (typeof refetch === 'function') refetch();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Confirm academic session deletion? This action cannot be undone.')) return;
        const res = await deleteData(`${apiUrl}/api/deleteAcademic/${id}`);
        if (res && typeof refetch === 'function') refetch();
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
            <div className="space-y-8">

                {/* Refined Header */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                            <div className="h-1 w-8 bg-blue-600 rounded-full" />
                            Academic Management
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            Academic <span className="text-slate-400 font-light">Directory</span>
                        </h1>
                    </div>

                    <button
                        onClick={() => setOpenModal(true)}
                        className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
                    >
                        <GraduationCap className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span>Add New Academic</span>
                    </button>
                </header>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="bg-white">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Semester Label</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Academic Year</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fetchLoading ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-slate-400">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                                            <p className="text-sm font-medium">Loading directory...</p>
                                        </td>
                                    </tr>
                                ) : academics.map((academic, index) => (
                                    <tr key={academic._id || index} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {academic.academic_sem_label?.charAt(0).toUpperCase() || '-'}
                                                </div>
                                                <span className="font-bold text-slate-800 text-sm">{academic.academic_sem_label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center justify-center text-sm font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                                                {academic.academic_sem_type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-semibold text-slate-600">{academic.academic_year}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {academic.active_sem ? (
                                                <div className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Active
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Inactive
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(academic)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(academic._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!fetchLoading && academics.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                            No academic records found in the database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Professional Modal */}
            {openModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="absolute inset-0" onClick={closeModal} />
                    <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border-t-[6px] border-blue-600 animate-in slide-in-from-bottom-8 duration-300">
                        <div className="p-8">

                            {/* Header Section */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <GraduationCap size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">{editingAcademic ? 'Edit Session' : 'Create Session'}</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{editingAcademic ? 'Update Academic Period' : 'Academic Setup'}</p>
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm mb-8 font-medium">
                                {editingAcademic ? 'Update the details for this academic session.' : 'Set up a new academic session. Define the semester type, label, and year.'}
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Academic Semester Label Field */}
                                <div className="flex flex-col">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2 ml-1">
                                        Semester Label
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="academic_sem_label"
                                            value={formData.academic_sem_label}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                                            placeholder="e.g. Nov/Dec Semester"
                                        />
                                    </div>
                                </div>

                                {/* Academic Semester Type & Year Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Academic Semester Type Field */}
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2 ml-1">
                                            Semester Type
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                name="academic_sem_type"
                                                value={formData.academic_sem_type}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none"
                                            >
                                                <option value="Odd">Odd</option>
                                                <option value="Even">Even</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Academic Year Field */}
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2 ml-1">
                                            Academic Year
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="academic_year"
                                                value={formData.academic_year}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                                                placeholder="e.g. 2025-2026"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Active Semester Toggle */}
                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-xl cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, active_sem: !prev.active_sem }))}>
                                    <div className={`relative w-12 h-6 rounded-full transition-colors ${formData.active_sem ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.active_sem ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Active Semester</p>
                                        <p className="text-xs text-slate-500 font-medium">Set this as the current active session</p>
                                    </div>
                                </div>

                                {/* Error Handling */}
                                {(postError || putError) && (
                                    <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 animate-in fade-in duration-200">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span className="text-xs font-bold uppercase tracking-tight">{postError || putError}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={postLoading || putLoading}
                                        className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {(postLoading || putLoading) ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                PROCESSING...
                                            </span>
                                        ) : (
                                            editingAcademic ? 'UPDATE SESSION' : 'CREATE SESSION'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicManage;