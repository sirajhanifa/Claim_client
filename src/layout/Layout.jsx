import React, { useState } from 'react';
import { Outlet, Link, useLocation, useParams } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaChartBar,
  FaUserCircle
} from 'react-icons/fa';
import { IoIosLogOut } from 'react-icons/io';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';


const Layout = () => {
  const location = useLocation();
  const { username } = useParams();

  const [openSettings, setOpenSettings] = useState(false);

  // Full menu list
  const fullMenu = [
    {
      name: 'Dashboard',
      path: `/layout/${username}/dashboard`,
      icon: <FaTachometerAlt />
    },
    {
      name: 'Claim Entry',
      path: `/layout/${username}/claimentry`,
      icon: <FaClipboardList />
    },
    {
      name: 'Claim Report',
      path: `/layout/${username}/claimreport`,
      icon: <FaChartBar />
    },
    {
      name: 'Staff Manage',
      path: `/layout/${username}/staffmanage`,
      icon: <FaUsers />
    },
    {
      name: 'Payment Status',
      path: `/layout/${username}/paymentstatus`,
      icon: <FaFileInvoiceDollar />
    },

    {
      name: 'Claim Manage',
      path: `/layout/${username}/claimmanage`,
      icon: <FaFileInvoiceDollar />
    },

    {
      name: 'Settings',
      icon: <FaUserCircle />,
      subMenu: [
        {
          name: 'Add User',
          path: `/layout/${username}/settings/adduser`
        },
        {
          name: 'Delete Claim',
          path: `/layout/${username}/settings/deleteclaim`
        }
      ]
    },
    {
      name: 'Logout',
      path: '/logout',
      icon: <IoIosLogOut />
    }
  ];

  // Finance-specific menu
  const financeMenu = [
    {
      name: 'Dashboard',
      path: `/layout/${username}/dashboard`,
      icon: <FaTachometerAlt />
    },
    {
      name: 'Payment Processing',
      path: `/layout/${username}/paymentprocessing`,
      icon: <FaFileInvoiceDollar />
    },
    {
      name: 'Logout',
      path: '/logout',
      icon: <IoIosLogOut />
    }

  ];

  // Choose menu based on role
  const sidebarMenu = username === 'fadmin' ? financeMenu : fullMenu;

  return (
    <div className="relative min-h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white text-gray-700 p-5 border-r border-gray-200 shadow-sm z-10">
        <h2 className="text-4xl font-black tracking-tight italic mb-6">
          <span className="text-blue-600">Claim</span>{' '}
          <span className="text-gray-800">Manager</span>
        </h2>

        <nav className="space-y-1.5 px-3">
          {sidebarMenu.map((item, index) => {
            const isActive = location.pathname === item.path;
            // Track open state by name to prevent all menus opening at once
            const isSubMenuOpen = openSettings === item.name;

            if (item.subMenu) {
              return (
                <div key={index} className="space-y-1">
                  <button
                    onClick={() => setOpenSettings(isSubMenuOpen ? null : item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group
              ${isSubMenuOpen ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xl transition-colors duration-300 ${isSubMenuOpen ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>
                        {item.icon}
                      </span>
                      {/* Using font-semibold and tracking-wide for a premium semi-bold feel */}
                      <span className="text-sm font-semibold tracking-wide">
                        {item.name}
                      </span>
                    </div>
                    <div className={`transition-transform duration-300 ${isSubMenuOpen ? 'rotate-180 text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>
                      <FiChevronDown size={16} />
                    </div>
                  </button>

                  {/* Submenu with a smooth height transition */}
                  <div className={`overflow-hidden transition-all duration-300 ${isSubMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="ml-4 pl-4 border-l border-slate-200 space-y-1 mt-1 mb-2">
                      {item.subMenu.map((sub, subIndex) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={subIndex}
                            to={sub.path}
                            className={`block px-3 py-2 rounded-lg text-[13px] transition-all duration-200 
                      ${isSubActive
                                ? 'text-blue-600 font-bold bg-blue-50/50'
                                : 'text-slate-500 font-medium hover:text-blue-600 hover:bg-slate-50'}`}
                          >
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
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 
          ${isActive
                    ? 'bg-blue-50/80 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
              >
                {/* Subtle active indicator to match your "Claim Entry" bar style */}
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-blue-600 rounded-r-full" />
                )}

                <span className={`text-xl transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-semibold'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pl-64 min-h-screen bg-gray-100 p-6 overflow-y-auto">
        {/* <div className="mb-6 flex justify-end">
          <div className="bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-lg text-sm text-gray-700 font-semibold flex items-center gap-2">
            <FaUserCircle className="text-blue-500 text-xl" />
            Logged in as: <span className="text-gray-900 font-bold">{username}</span>
          </div>
        </div> */}

        {/* Nested Route Content */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;


