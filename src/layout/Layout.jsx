import React, { useState } from 'react';
import { Outlet, Link, useLocation, useParams } from 'react-router-dom';
import {
	FaTachometerAlt,
	FaUsers,
	FaClipboardList,
	FaFileInvoiceDollar,
	FaChartBar,
	FaUserCircle,
	FaShieldAlt,
	FaSignOutAlt
} from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';

const Layout = () => {

	const location = useLocation();
	const { username } = useParams();
	const [openSettings, setOpenSettings] = useState(null);

	const fullMenu = [
		{ name: 'Dashboard', path: `/layout/${username}/dashboard`, icon: <FaTachometerAlt /> },
		{ name: 'Claim Entry', path: `/layout/${username}/claimentry`, icon: <FaClipboardList /> },
		{ name: 'Claim Report', path: `/layout/${username}/claimreport`, icon: <FaChartBar /> },
		{ name: 'Staff Manage', path: `/layout/${username}/staffmanage`, icon: <FaUsers /> },
		{ name: 'Payment Status', path: `/layout/${username}/paymentstatus`, icon: <FaFileInvoiceDollar /> },
		{ name: 'Claim Manage', path: `/layout/${username}/claimmanage`, icon: <FaFileInvoiceDollar /> },
		{
			name: 'Settings',
			icon: <FaShieldAlt />,
			subMenu: [
				{ name: 'Add User', path: `/layout/${username}/settings/adduser` },
				{ name: 'Delete Claim', path: `/layout/${username}/settings/deleteclaim` }
			]
		},
		{ name: 'Logout', path: '/logout', icon: <FaSignOutAlt /> }
	];

	const financeMenu = [
		{ name: 'Dashboard', path: `/layout/${username}/dashboard`, icon: <FaTachometerAlt /> },
		{ name: 'Payment Processing', path: `/layout/${username}/paymentprocessing`, icon: <FaFileInvoiceDollar /> },
		{ name: 'Logout', path: '/logout', icon: <FaSignOutAlt /> }
	];

	const sidebarMenu = username === 'fadmin' ? financeMenu : fullMenu;

	return (
		<div className="flex min-h-screen bg-slate-50/50">

			{/* Sidebar */}
			<aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200/60 shadow-xl shadow-slate-200/20 z-20 flex flex-col">
				{/* Logo Section */}
				<div className="h-20 flex items-center px-8 border-b border-slate-50 flex-shrink-0">
					<h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
						<span className="bg-blue-600 text-white p-1.5 rounded-lg shadow-blue-200 shadow-lg">
							<FaClipboardList size={18} />
						</span>
						<div className="flex flex-col leading-none -mt-1">
							<span className="text-slate-900 text-lg uppercase tracking-wider font-extrabold">Claim</span>
							<span className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] -mt-0.5">Manager</span>
						</div>
					</h2>
				</div>

				{/* Scrollable Navigation Area */}
				<nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
					<p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>

					{sidebarMenu.map((item, index) => {
						// Filter out Logout from the main loop if you want it strictly at the bottom
						if (item.name === 'Logout') return null;

						const isActive = location.pathname === item.path;
						const isSubMenuOpen = openSettings === item.name;

						if (item.subMenu) {
							return (
								<div key={index} className="space-y-1">
									<button
										onClick={() => setOpenSettings(isSubMenuOpen ? null : item.name)}
										className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                            			${isSubMenuOpen ? 'bg-slate-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
									>
										<div className="flex items-center gap-3">
											<span className={`text-lg ${isSubMenuOpen ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>
												{item.icon}
											</span>
											<span className="text-sm font-semibold">{item.name}</span>
										</div>
										<FiChevronDown size={14} className={`transition-transform duration-300 ${isSubMenuOpen ? 'rotate-180' : ''}`} />
									</button>

									<div className={`overflow-hidden transition-all duration-300 ${isSubMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
										<div className="ml-9 border-l-2 border-slate-100 space-y-1 py-1">
											{item.subMenu.map((sub, subIndex) => {
												const isSubActive = location.pathname === sub.path;
												return (
													<Link
														key={subIndex}
														to={sub.path}
														className={`block pl-6 py-2 text-[13px] transition-all duration-200 relative
                                            			${isSubActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-blue-600'}`}
													>
														{isSubActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-600" />}
														{sub.name}
													</Link>
												);
											})}
										</div>
									</div>
								</div>
							);
						}

						return (
							<Link
								key={index}
								to={item.path}
								className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative
                    				${isActive
										? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
										: 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
							>
								<span className={`text-lg ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`}>
									{item.icon}
								</span>
								<span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
									{item.name}
								</span>
							</Link>
						);
					})}
				</nav>

				{/* Bottom Actions Area (Logout) */}
				<div className="p-4 border-t border-slate-100">
					<Link
						to="/logout"
						className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 font-semibold text-sm"
					>
						<FaSignOutAlt className="text-lg" />
						<span>Logout</span>
					</Link>
				</div>
			</aside>

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col min-h-screen ml-64 w-[calc(100%-16rem)] overflow-x-hidden">
				<main className="p-10">
					<div className="mx-auto">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
};

export default Layout;