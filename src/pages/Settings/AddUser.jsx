import React, { useState } from 'react';
import { UserPlus, Shield, User, Trash2, Edit3, Search, AlertCircle, Loader2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import usePost from '../../hooks/usePost';
import useDelete from '../../hooks/useDelete';

const AddUser = () => {

	const apiUrl = import.meta.env.VITE_API_URL;
	const [openModal, setOpenModal] = useState(false);
	const [formData, setFormData] = useState({ username: '', password: '' });
	const { data: users = [], refetch, loading: fetchLoading } = useFetch(`${apiUrl}/api/getUser`);
	const { postData, loading: postLoading, error: postError } = usePost();
	const { deleteData, loading: deleteLoading } = useDelete();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const res = await postData(`${apiUrl}/api/addUser`, formData);
		if (res) {
			setFormData({ username: '', password: '' });
			setOpenModal(false);
			if (typeof refetch === 'function') refetch();
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Confirm user deletion? This action cannot be undone.')) return;
		const res = await deleteData(`${apiUrl}/api/deleteUser/${id}`);
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
							Access Management
						</div>
						<h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
							User <span className="text-slate-400 font-light">Directory</span>
						</h1>
					</div>

					<button
						onClick={() => setOpenModal(true)}
						className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
					>
						<UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
						<span>Add New User</span>
					</button>
				</header>

				{/* Main Content Card */}
				<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-center border-collapse">
							<thead>
								<tr className="bg-white">
									<th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
									<th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Identify</th>
									<th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Security Token</th>
									<th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Operations</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{fetchLoading ? (
									<tr>
										<td colSpan="4" className="py-20 text-center text-slate-400">
											<Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
											<p className="text-sm font-medium">Loading directory...</p>
										</td>
									</tr>
								) : users.map((user, index) => (
									<tr key={user._id || index} className="hover:bg-slate-50/80 transition-colors group">
										<td className="px-6 py-4 text-sm font-mono text-slate-400">#{(index + 1).toString().padStart(2, '0')}</td>
										<td className="px-6 py-4">
											<div className="flex items-center justify-center gap-3">
												<div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
													{user.username.charAt(0).toUpperCase()}
												</div>
												<span className="font-bold text-slate-800 text-sm">{user.username}</span>
											</div>
										</td>
										<td className="px-6 py-4 text-center">
											<div className="flex items-center justify-center gap-2 text-slate-500 font-mono text-xs bg-slate-100 w-fit px-2 py-1 rounded mx-auto">
												<Shield className="w-3 h-3 opacity-50" />
												{user.password.replace(/./g, '•').substring(0, 12)}
											</div>
										</td>
										<td className="px-6 py-4">
											<button
												onClick={() => handleDelete(user._id)}
												className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</td>
									</tr>
								))}
								{!fetchLoading && users.length === 0 && (
									<tr>
										<td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic text-sm">
											No user records found in the database.
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
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setOpenModal(false)} />

					<div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="p-8">
							<div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
								<UserPlus className="text-blue-600 w-6 h-6" />
							</div>

							<h2 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h2>
							<p className="text-slate-500 text-sm mb-8">Set up login credentials for the new user.</p>

							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
										<input
											type="text"
											name="username"
											value={formData.username}
											onChange={handleChange}
											required
											className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
											placeholder="e.g. john_doe"
										/>
									</div>
								</div>

								<div className="space-y-1.5">
									<label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
									<div className="relative">
										<Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
										<input
											type="password"
											name="password"
											value={formData.password}
											onChange={handleChange}
											required
											className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
											placeholder="••••••••"
										/>
									</div>
								</div>

								{postError && (
									<div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-xs font-medium">
										<AlertCircle className="w-4 h-4" />
										{postError}
									</div>
								)}

								<div className="flex gap-3 pt-4">
									<button
										type="button"
										onClick={() => setOpenModal(false)}
										className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={postLoading}
										className="flex-1 px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 transition-all"
									>
										{postLoading ? 'Processing...' : 'Create Account'}
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

export default AddUser;