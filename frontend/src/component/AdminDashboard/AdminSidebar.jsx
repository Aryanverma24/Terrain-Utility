import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaHome, FaUsers, FaLandmark, FaChartBar,
    FaClipboardList, FaBell, FaCog,
    FaExclamationTriangle, FaShieldAlt,
    FaSignOutAlt, FaBars, FaTimes
} from 'react-icons/fa';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeItem, setActiveItem] = useState(location.pathname);

    const menuItems = [
        { 
            label: "Dashboard", 
            icon: FaHome, 
            path: "/adminDashboard",
            color: "from-blue-500 to-cyan-500"
        },
        { 
            label: "Users", 
            icon: FaUsers, 
            path: "/admin/users",
            color: "from-purple-500 to-pink-500"
        },
        { 
            label: "Lands", 
            icon: FaLandmark, 
            path: "/admin/lands",
            color: "from-emerald-500 to-green-500"
        },
        { 
            label: "Analytics", 
            icon: FaChartBar, 
            path: "/admin/analytics",
            color: "from-orange-500 to-red-500"
        },
        { 
            label: "Reports", 
            icon: FaClipboardList, 
            path: "/admin/reports",
            color: "from-indigo-500 to-purple-500"
        },
        { 
            label: "Notifications", 
            icon: FaBell, 
            path: "/admin/notifications",
            color: "from-yellow-500 to-orange-500"
        },
        { 
            label: "Settings", 
            icon: FaCog, 
            path: "/admin/settings",
            color: "from-gray-500 to-slate-500"
        },
        { 
            label: "Help", 
            icon: FaExclamationTriangle, 
            path: "/admin/help",
            color: "from-teal-500 to-cyan-500"
        }
    ];

    const handleLogout = () => {
        localStorage.clear();
        toast.success("Logged out successfully");
        navigate("/admin-login");
    };

    return (
        <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-emerald-900/20 to-slate-900 border-r border-emerald-500/20 transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col backdrop-blur-xl`}>

            {/* Header */}
            <div className="py-6 px-2 flex justify-between items-center border-b border-emerald-500/20">
                <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl">
                        <FaShieldAlt className="text-white text-xl" />
                    </div>
                    {sidebarOpen && (
                        <div className="ml-3">
                            <h2 className="text-white font-bold text-lg">Admin Panel</h2>
                            <p className="text-emerald-400 text-xs">Control Center</p>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                >
                    {sidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-4 px-2">
                <ul className="space-y-2">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <li key={index}>
                                <button
                                    onClick={() => {
                                        navigate(item.path);
                                        setActiveItem(item.path);
                                    }}
                                    className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                                        isActive
                                            ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg ${
                                        isActive 
                                            ? 'bg-white/20' 
                                            : 'bg-white/10 group-hover:bg-white/20'
                                    }`}>
                                        <Icon className="text-lg" />
                                    </div>
                                    {sidebarOpen && (
                                        <>
                                            <span className="ml-3 font-medium">{item.label}</span>
                                            {isActive && (
                                                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                            )}
                                        </>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-emerald-500/20">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
                >
                    <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20">
                        <FaSignOutAlt className="text-lg" />
                    </div>
                    {sidebarOpen && (
                        <>
                            <span className="ml-3 font-medium">Logout</span>
                            <div className="ml-auto w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;