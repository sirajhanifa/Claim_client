import React, { useState } from 'react';
import usePost from '../../hooks/usePost';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import JmcLogo from '../../assets/logo.jpeg';
import Jmc75 from '../../assets/75.jpeg';
import { User, Lock, Loader2 } from 'lucide-react';

const brandColor = '#192F5D';
const hoverColor = '#0F1E40';
const accentColor = '#4E7FFF';

const Login = () => {

	const apiUrl = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const { postData } = usePost();

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await postData(`${apiUrl}/api/login`, { username, password });

			if (res.message === 'Login successful!') {
				const { token, user } = res;
				localStorage.setItem('authToken', token);
				localStorage.setItem('username', user.username);

				Swal.fire('Success', 'Login Successful!', 'success');
				navigate(`/layout/${user.username}/dashboard`);
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Authentication Failed',
					text: 'Incorrect Login Credentials.',
					confirmButtonColor: brandColor,
				});
			}
		} catch (err) {
			Swal.fire({
				icon: 'error',
				title: 'Critical Error',
				text: 'Unable to connect to the server. Please check your network.',
				confirmButtonColor: brandColor,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center py-8 px-4">
			<div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
				<div className="flex">
					<div
						className="hidden md:flex flex-col justify-between col-span-3 p-12 text-white relative overflow-hidden"
						style={{ backgroundColor: brandColor }}
					>
						<div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-transparent to-transparent opacity-10 pointer-events-none"></div>

						{/* HEADER SECTION */}
						<div className="space-y-4 z-10">

							{/* LOGO + COLLEGE NAME + 75 YEARS */}
							<div className="flex items-center justify-between">

								{/* Left Logo */}
								<img
									src={JmcLogo}
									alt="College Logo"
									className="h-20 w-20 drop-shadow-md rounded-lg"
								/>

								{/* College Name (center aligned) */}
								<div className="flex flex-col items-center text-center px-2 flex-1">
									<p className="text-indigo-100 text-lg font-bold">
										JAMAL MOHAMED COLLEGE
									</p>
									<p className="text-indigo-200 text-sm font-semibold tracking-wide mt-1">
										Autonomous, Trichy - 620 020.
									</p>
								</div>

								{/* Right Logo */}
								<img
									src={Jmc75}
									alt="JMC 75 Years"
									className="h-20 w-20 drop-shadow-md rounded-lg"
								/>
							</div>

							{/* Separator */}
							<div className="h-0.5 w-full bg-indigo-100 opacity-40 mt-3"></div>
						</div>

						{/* TITLE SECTION */}
						<div className="space-y-5 z-10 mt-4">
							<p className="uppercase text-indigo-300 tracking-[0.2em] text-xs font-medium">
								Management Suite
							</p>
							<h1 className="text-4xl font-extrabold tracking-tight">
								Claim <span className="text-amber-400">Manager</span>
							</h1>
							<p className="text-indigo-200 text-sm mt-2 leading-relaxed">
								Enterprise platform for secure documentation and claim workflow operations.
							</p>
						</div>

						{/* FOOTER TAG */}
						<div className="z-10 mt-4">
							<p className="text-[10px] text-indigo-300 opacity-90 uppercase">
								Authorized Systems Only
							</p>
						</div>
					</div>

					<div className="col-span-4 p-8 sm:p-10 flex flex-col justify-center">
						<div className="flex justify-center md:hidden mb-6">
							<img src={JmcLogo} alt="College Logo" className="h-12 w-auto" />
						</div>
						<div className="space-y-1 mb-8">
							<h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">System Authentication</h2>
							<p className="text-gray-500 text-base">Access the internal claim processing suite.</p>
						</div>
						<form onSubmit={handleLogin} className="space-y-6">
							<div>
								<label htmlFor="username" className="block font-semibold text-gray-700 text-sm mb-3">USERNAME</label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input
										id="username"
										type="text"
										placeholder="Registered Username or ID"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										className={`w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg bg-transparent text-gray-800 focus:border-0 focus:ring-2 focus:ring-[${accentColor}] focus:outline-none transition duration-200`}
										required
									/>
								</div>
							</div>
							<div>
								<label htmlFor="password" className="block font-semibold text-gray-700 text-sm mb-3">PASSWORD</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input
										id="password"
										type="password"
										placeholder="••••••••"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className={`w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg bg-transparent text-gray-800 focus:border-0 focus:ring-2 focus:ring-[${accentColor}] focus:outline-none transition duration-200`}
										required
									/>
								</div>
							</div>
							<button
								type="submit"
								disabled={loading}
								style={{ backgroundColor: loading ? hoverColor : brandColor }}
								className={`w-full py-2.5 mt-3 text-white font-bold text-base rounded-lg shadow-lg transition transform hover:scale-[1.01] hover:shadow-xl ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-95'}`}
							>
								{loading ? (
									<div className="flex items-center justify-center" role="status" aria-label="Authenticating">
										<Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
										Authenticating...
									</div>
								) : (
									"SECURE LOGIN"
								)}
							</button>
						</form>
						<p className="mt-8 text-center text-[10px] text-gray-400 tracking-wide">
							© 2025 Jamal Mohamed College — Claim Management System. All Rights Reserved.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Login;