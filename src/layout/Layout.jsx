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
        <h2 className="text-3xl font-extrabold mb-6 tracking-wide">
          <span className="text-blue-600">Claim</span>{' '}
          <span className="text-gray-800">Manager</span>
        </h2>

        <nav className="space-y-1">
          {sidebarMenu.map((item, index) => {
            if (item.subMenu) {
              return (
                <div key={index}>
                  <button
                    onClick={() => setOpenSettings(!openSettings)}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-blue-600 transition duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                    {openSettings ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  {openSettings && (
                    <div className="ml-8 space-y-1 mt-1">
                      {item.subMenu.map((sub, subIndex) => (
                        <Link
                          key={subIndex}
                          to={sub.path}
                          className={`block px-3 py-2 rounded-md text-sm transition duration-200 ${location.pathname === sub.path
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-200 hover:text-blue-600'
                            }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-md transition duration-200 ${location.pathname === item.path
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-200 hover:text-blue-600'
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pl-64 min-h-screen bg-gray-100 p-6 overflow-y-auto">
        <div className="mb-6 flex justify-end">
          <div className="bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-lg text-sm text-gray-700 font-semibold flex items-center gap-2">
            <FaUserCircle className="text-blue-500 text-xl" />
            Logged in as: <span className="text-gray-900 font-bold">{username}</span>
          </div>
        </div>

        {/* Nested Route Content */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
