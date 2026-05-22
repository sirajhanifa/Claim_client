import React, { useState, useMemo, useEffect } from 'react';
import {
    GraduationCap, Calendar, Clock, CheckCircle2, XCircle,
    Trash2, Edit3, AlertCircle, Loader2, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import usePost from '../hooks/usePost';
import usePut from '../hooks/usePut';
import useDelete from '../hooks/useDelete';

const AcademicManage = () => {

    const apiUrl = import.meta.env.VITE_API_URL;

    // Data state
    const [academics, setAcademics] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Modal & form state
    const [openModal, setOpenModal] = useState(false);
    const [editingAcademic, setEditingAcademic] = useState(null);
    const [formData, setFormData] = useState({
        academic_sem_label: '',
        academic_sem_type: 'Odd',
        academic_year: '',
        active_sem: false
    });
    const [validationErrors, setValidationErrors] = useState({});

    // Custom hooks for mutations
    const { postData, loading: postLoading, error: postError } = usePost();
    const { putData, loading: putLoading, error: putError } = usePut();
    const { deleteData } = useDelete();

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null, originalOrder: [] });

    // Helper: Load academics from API
    const loadAcademics = async () => {
        setFetchLoading(true);
        setFetchError(null);
        try {
            const response = await fetch(`${apiUrl}/api/getAcademic`);
            if (!response.ok) throw new Error('Failed to fetch academics');
            const data = await response.json();
            setAcademics(data);
            setSortConfig(prev => ({ ...prev, originalOrder: data }));
        } catch (err) {
            setFetchError(err.message);
        } finally {
            setFetchLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        loadAcademics();
    }, [apiUrl]);

    const isValidSemLabel = (label) => {
        const regex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/;
        return regex.test(label);
    };

    const isValidAcademicYear = (year) => {
        const regex = /^\d{4}-\d{4}$/;
        if (!regex.test(year)) return false;
        const [start, end] = year.split('-').map(Number);
        return end === start + 1;
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.academic_sem_label.trim()) {
            errors.academic_sem_label = 'Semester label is required';
        } else if (!isValidSemLabel(formData.academic_sem_label)) {
            errors.academic_sem_label = 'Format must be "Mon-YY" (e.g., Jun-26)';
        }

        if (!formData.academic_year.trim()) {
            errors.academic_year = 'Academic year is required';
        } else if (!isValidAcademicYear(formData.academic_year)) {
            errors.academic_year = 'Format must be "YYYY-YYYY" and second year = first year + 1 (e.g., 2026-2027)';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Form handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: undefined }));
        }
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
        setValidationErrors({});
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
        if (!validateForm()) return;

        let res;
        if (editingAcademic) {
            res = await putData(`${apiUrl}/api/updateAcademic/${editingAcademic._id}`, formData);
        } else {
            res = await postData(`${apiUrl}/api/addAcademic`, formData);
        }
        if (res) {
            closeModal();
            await loadAcademics();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Confirm academic session deletion? This action cannot be undone.')) return;
        const res = await deleteData(`${apiUrl}/api/deleteAcademic/${id}`);
        if (res) await loadAcademics();
    };

    // Sorting logic (unchanged)
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') {
                setSortConfig({ key: null, direction: null, originalOrder: sortConfig.originalOrder });
                return;
            }
        }
        setSortConfig({ key, direction, originalOrder: sortConfig.originalOrder });
    };

    const sortedAcademics = useMemo(() => {
        if (!academics.length) return [];
        if (!sortConfig.key || sortConfig.direction === null) {
            return sortConfig.originalOrder.length ? sortConfig.originalOrder : academics;
        }
        const sorted = [...academics];
        sorted.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (sortConfig.key === 'active_sem') {
                aVal = aVal ? 1 : 0;
                bVal = bVal ? 1 : 0;
            } else {
                aVal = (aVal || '').toString().toLowerCase();
                bVal = (bVal || '').toString().toLowerCase();
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [academics, sortConfig]);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-50" />;
        if (sortConfig.direction === 'asc') return <ArrowUp className="w-3 h-3 ml-1 inline-block text-blue-600" />;
        if (sortConfig.direction === 'desc') return <ArrowDown className="w-3 h-3 ml-1 inline-block text-blue-600" />;
        return <ArrowUpDown className="w-3 h-3 ml-1 inline-block" />;
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
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
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                    <GraduationCap className="w-4 h-4" />
                    Add Academic
                </button>
            </header>

            {/* Main Table */}
            <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                        Academic Sessions
                    </h2>
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                        Total : {academics.length}
                    </div>
                </div>

                <div className="relative w-full overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 z-30">
                                <tr className="bg-slate-50/90">
                                    <th className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider text-center cursor-pointer hover:text-blue-600 transition-colors select-none border-b border-slate-200"
                                        onClick={() => handleSort('academic_sem_label')}>
                                        <span className="inline-flex items-center gap-1">Semester Label {getSortIcon('academic_sem_label')}</span>
                                    </th>
                                    <th className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider text-center cursor-pointer hover:text-blue-600 transition-colors select-none border-b border-slate-200"
                                        onClick={() => handleSort('academic_sem_type')}>
                                        <span className="inline-flex items-center gap-1">Type {getSortIcon('academic_sem_type')}</span>
                                    </th>
                                    <th className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider text-center cursor-pointer hover:text-blue-600 transition-colors select-none border-b border-slate-200"
                                        onClick={() => handleSort('academic_year')}>
                                        <span className="inline-flex items-center gap-1">Academic Year {getSortIcon('academic_year')}</span>
                                    </th>
                                    <th className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider text-center cursor-pointer hover:text-blue-600 transition-colors select-none border-b border-slate-200"
                                        onClick={() => handleSort('active_sem')}>
                                        <span className="inline-flex items-center gap-1">Status {getSortIcon('active_sem')}</span>
                                    </th>
                                    <th className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider text-center border-b border-slate-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fetchLoading ? (
                                    <tr><td colSpan="5" className="text-center py-20">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                                            <p className="text-slate-500 text-sm">Loading academic directory...</p>
                                        </div>
                                    </td></tr>
                                ) : sortedAcademics.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                                <GraduationCap className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-slate-900 font-semibold">No academic records found</h3>
                                            <p className="text-slate-500 text-sm mt-1">Click "Add Academic" to create one.</p>
                                        </div>
                                    </td></tr>
                                ) : (
                                    sortedAcademics.map((academic) => (
                                        <tr key={academic._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                        {academic.academic_sem_label?.charAt(0).toUpperCase() || '-'}
                                                    </div>
                                                    <span className="font-bold text-[15px] text-slate-900">{academic.academic_sem_label}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="inline-flex items-center justify-center text-sm font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                                                    {academic.academic_sem_type}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-sm font-semibold text-slate-600">{academic.academic_year}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                {academic.active_sem ? (
                                                    <div className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200">
                                                        <XCircle className="w-3.5 h-3.5" /> Inactive
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => handleEdit(academic)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all" title="Edit">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(academic._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {openModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 leading-none">
                                    {editingAcademic ? 'Edit Academic Session' : 'Add New Academic'}
                                </h2>
                                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">Session Configuration</p>
                            </div>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 max-h-[65vh] overflow-y-auto">
                            <form onSubmit={handleSubmit} id="academic-form" className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Semester Label */}
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">SEMESTER LABEL</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="academic_sem_label"
                                                value={formData.academic_sem_label}
                                                onChange={handleChange}
                                                required
                                                placeholder="e.g. Jun-26"
                                                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all ${validationErrors.academic_sem_label ? 'border-red-400' : 'border-slate-100'
                                                    }`}
                                            />
                                        </div>
                                        {validationErrors.academic_sem_label && (
                                            <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.academic_sem_label}</p>
                                        )}
                                    </div>

                                    {/* Semester Type & Academic Year */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">SEMESTER TYPE</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <select
                                                    name="academic_sem_type"
                                                    value={formData.academic_sem_type}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none"
                                                >
                                                    <option value="Odd">Odd</option>
                                                    <option value="Even">Even</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">ACADEMIC YEAR</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="academic_year"
                                                    value={formData.academic_year}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="e.g. 2026-2027"
                                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all ${validationErrors.academic_year ? 'border-red-400' : 'border-slate-100'
                                                        }`}
                                                />
                                            </div>
                                            {validationErrors.academic_year && (
                                                <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.academic_year}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Active Semester Toggle */}
                                    <div
                                        className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 p-4 rounded-xl cursor-pointer transition-all hover:border-blue-200"
                                        onClick={() => setFormData(prev => ({ ...prev, active_sem: !prev.active_sem }))}
                                    >
                                        <div className={`relative w-12 h-6 rounded-full transition-colors ${formData.active_sem ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.active_sem ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Active Semester</p>
                                            <p className="text-xs text-slate-500 font-medium">Set this as the current active session</p>
                                        </div>
                                    </div>
                                </div>

                                {/* API Error */}
                                {(postError || putError) && (
                                    <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span className="text-xs font-bold uppercase tracking-tight">{postError || putError}</span>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex gap-3">
                            <button type="button" onClick={closeModal} className="flex-1 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                                Cancel
                            </button>
                            <button type="submit" form="academic-form" disabled={postLoading || putLoading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                                {postLoading || putLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> PROCESSING...
                                    </span>
                                ) : (editingAcademic ? 'SAVE CHANGES' : 'CREATE SESSION')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicManage;