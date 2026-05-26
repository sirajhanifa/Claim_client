import React, { useState, useMemo, useEffect } from 'react';
import {
    UserPlus, Shield, User, Trash2, Edit3, AlertCircle, Loader2,
    Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown, Coins
} from 'lucide-react';
import useFetch from '../hooks/useFetch';
import usePost from '../hooks/usePost';
import usePut from '../hooks/usePut';
import useDelete from '../hooks/useDelete';

const UserControl = () => {

    const apiUrl = import.meta.env.VITE_API_URL;
    const [openModal, setOpenModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'staff' });
    const [showPassword, setShowPassword] = useState(false);
    const { data: users = [], refetch, loading: fetchLoading } = useFetch(`${apiUrl}/api/getUser`);
    const { postData, loading: postLoading, error: postError } = usePost();
    const { putData, loading: putLoading, error: putError } = usePut();
    const { deleteData, loading: deleteLoading } = useDelete();

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null, originalOrder: [] });

    // Store original order when data loads
    useEffect(() => {
        setSortConfig(prev => ({ ...prev, originalOrder: [...users] }));
    }, [users]);

    const handleSort = (key) => {
        if (key === 'actions') return;
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

    const sortedUsers = useMemo(() => {
        if (!users.length) return [];
        if (!sortConfig.key || sortConfig.direction === null) {
            return sortConfig.originalOrder.length ? sortConfig.originalOrder : users;
        }
        const sorted = [...users];
        sorted.sort((a, b) => {
            let aVal = a[sortConfig.key] || '';
            let bVal = b[sortConfig.key] || '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [users, sortConfig]);

    // Get sort icon for header
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-50" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ArrowUp className="w-3 h-3 ml-1 inline-block text-blue-600" />;
        }
        if (sortConfig.direction === 'desc') {
            return <ArrowDown className="w-3 h-3 ml-1 inline-block text-blue-600" />;
        }
        return <ArrowUpDown className="w-3 h-3 ml-1 inline-block" />;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const closeModal = () => {
        setOpenModal(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', role: 'staff' });
        setShowPassword(false);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({ username: user.username, password: user.password, role: user.role || 'staff' });
        setOpenModal(true);
        setShowPassword(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let res;
        if (editingUser) {
            res = await putData(`${apiUrl}/api/updateUser/${editingUser._id}`, formData);
        } else {
            res = await postData(`${apiUrl}/api/addUser`, formData);
        }
        if (res) {
            closeModal();
            if (typeof refetch === 'function') refetch();
        }
    };

    const handleDelete = async () => {
        if (!confirmDeleteUser) return;
        const res = await deleteData(`${apiUrl}/api/deleteUser/${confirmDeleteUser._id}`);
        if (res && typeof refetch === 'function') refetch();
        setConfirmDeleteUser(null);
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        <div className="h-1 w-8 bg-blue-600 rounded-full" />
                        Access Management
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        User <span className="text-slate-400 font-light">Directory</span>
                    </h1>
                </div>
                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    Add User
                </button>
            </header>

            {/* User Table */}
            <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                        Registered Users
                    </h2>
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                        Total Users : {users.length}
                    </div>
                </div>

                <div className="relative w-full overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 z-30">
                                <tr className="bg-slate-50/90">
                                    <th className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider text-center border-b border-slate-200">
                                        S.No
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider text-center cursor-pointer hover:text-blue-600 transition-colors select-none border-b border-slate-200"
                                        onClick={() => handleSort('username')}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            User Details {getSortIcon('username')}
                                        </span>
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider text-center cursor-pointer hover:text-blue-600 transition-colors select-none border-b border-slate-200"
                                        onClick={() => handleSort('role')}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            Role {getSortIcon('role')}
                                        </span>
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider text-center cursor-pointer hover:text-blue-600 transition-colors select-none border-b border-slate-200"
                                        onClick={() => handleSort('password')}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            Security Token {getSortIcon('password')}
                                        </span>
                                    </th>
                                    <th className="px-6 py-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider text-center border-b border-slate-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fetchLoading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                                                <p className="text-slate-500 text-sm">Loading user directory...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : sortedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                                    <User className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <h3 className="text-slate-900 font-semibold">No users found</h3>
                                                <p className="text-slate-500 text-sm mt-1">Click "Add User" to create one.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedUsers.map((user, idx) => (
                                        <tr key={user._id || idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 text-slate-400 font-mono text-xs text-center">
                                                {idx + 1}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                        {user.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-[15px] text-slate-900">
                                                        {user.username}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                {user.role === 'admin' ? (
                                                    <div className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-200 mx-auto w-fit">
                                                        <Shield className="w-3.5 h-3.5" /> Admin
                                                    </div>
                                                ) : user.role === 'finance' ? (
                                                    <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 mx-auto w-fit">
                                                        <Coins className="w-3.5 h-3.5" /> Finance
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200 mx-auto w-fit">
                                                        <User className="w-3.5 h-3.5" /> Staff
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2 text-slate-700 text-sm font-mono bg-slate-100 w-fit px-3 py-1.5 rounded-lg mx-auto">
                                                    <Shield className="w-3 h-3 text-slate-400" />
                                                    {user.password}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteUser(user)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
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

            {/* Add/Edit Modal */}
            {openModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 leading-none">
                                    {editingUser ? 'Edit User Account' : 'Add New User'}
                                </h2>
                                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">
                                    Credential Management
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 max-h-[65vh] overflow-y-auto">
                            <form onSubmit={handleSubmit} id="user-form" className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            USERNAME
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                                placeholder="e.g. john_doe"
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            PASSWORD
                                        </label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-1">
                                            ROLE
                                        </label>
                                        <div className="relative font-bold">
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="staff">Staff</option>
                                                <option value="admin">Admin</option>
                                                <option value="finance">Finance</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {(postError || putError) && (
                                    <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span className="text-xs font-bold uppercase tracking-tight">{postError || putError}</span>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="user-form"
                                disabled={postLoading || putLoading}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {postLoading || putLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        PROCESSING...
                                    </span>
                                ) : (
                                    editingUser ? 'SAVE CHANGES' : 'CREATE USER'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDeleteUser && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-red-600 p-8 text-white flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-bold">Irreversible Action</h3>
                            <p className="text-red-100 text-sm mt-2">You are about to delete user account:</p>
                            <div className="px-4 py-2 bg-black/10 rounded-lg font-bold text-xl border border-white/20 mt-2">
                                {confirmDeleteUser.username}
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <p className="text-slate-600 text-center text-sm leading-relaxed">
                                This will permanently remove this user from the system. All associated data may be affected. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDeleteUser(null)}
                                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                    className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {deleteLoading ? 'DELETING...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserControl;