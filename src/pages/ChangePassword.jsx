import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, Key } from 'lucide-react';
import Swal from 'sweetalert2';
import usePut from '../hooks/usePut';

const ChangePassword = () => {

    const { username } = useParams();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { putData, loading } = usePut();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Password Mismatch',
                text: 'New Password and Confirm Password do not match!',
                confirmButtonColor: '#192F5D',
            });
            return;
        }

        if (newPassword.length < 4) {
            Swal.fire({
                icon: 'warning',
                title: 'Weak Password',
                text: 'New Password must be at least 4 characters long.',
                confirmButtonColor: '#192F5D',
            });
            return;
        }

        try {
            const res = await putData(`${apiUrl}/api/changePassword`, {
                username,
                currentPassword,
                newPassword
            });

            if (res) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Password updated successfully!',
                    confirmButtonColor: '#192F5D',
                }).then(() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    navigate(`/layout/${username}/dashboard`);
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Failed to update password. Please try again.',
                confirmButtonColor: '#192F5D',
            });
        }
    };

    return (
        <div className="flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-xl w-full border border-slate-200/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-[#192F5D] p-8 text-white flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                        <Key size={30} className="text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Security Credentials</h2>
                    <p className="text-indigo-200 text-sm mt-1">Change password for account : <span className="font-bold text-white">{username}</span></p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Inputs Formatted to Stack Full-Width */}
                    <div className="grid grid-cols-3 gap-10">

                        {/* Current Password */}
                        <div className="w-full">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 block ml-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    placeholder="Enter current password"
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-semibold focus:border-blue-500 focus:bg-white outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="w-full">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 block ml-1">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    placeholder="Enter new password"
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-semibold focus:border-blue-500 focus:bg-white outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="w-full">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 block ml-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm new password"
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-semibold focus:border-blue-500 focus:bg-white outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Aligned to the Right Side */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(`/layout/${username}/dashboard`)}
                            className="cursor-pointer px-6 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm min-w-[120px]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer px-6 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2 min-w-[160px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;