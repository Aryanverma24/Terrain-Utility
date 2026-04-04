import React from "react";
import AdminDashboardLayout from "./AdminDashoardLayout";
import {
    FaUsers,
    FaLandmark,
    FaChartLine,
    FaUserShield,
    FaClipboardList,
    FaArrowUp
} from "react-icons/fa";

const AdminDashboard = () => {
    return (
        <AdminDashboardLayout>

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-gray-400">
                    Overview of system performance and activities
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

                <StatCard
                    title="Total Users"
                    value="1,240"
                    icon={<FaUsers />}
                    growth="+12%"
                />

                <StatCard
                    title="Total Lands"
                    value="320"
                    icon={<FaLandmark />}
                    growth="+8%"
                />

                <StatCard
                    title="Admin Users"
                    value="12"
                    icon={<FaUserShield />}
                    growth="+2%"
                />

                <StatCard
                    title="Reports"
                    value="45"
                    icon={<FaClipboardList />}
                    growth="+5%"
                />
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Section */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Activity Overview */}
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Activity Overview
                        </h2>

                        <div className="h-40 flex items-center justify-center text-gray-400">
                            📊 Chart Placeholder (Connect Chart.js / Recharts)
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Recent Users
                        </h2>

                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-white/10">
                                    <th className="py-2 text-left">Name</th>
                                    <th className="py-2 text-left">Email</th>
                                    <th className="py-2 text-left">Role</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr className="border-b border-white/5">
                                    <td className="py-2 text-white">Aryan</td>
                                    <td className="text-gray-300">aryan@mail.com</td>
                                    <td className="text-emerald-400">User</td>
                                </tr>

                                <tr className="border-b border-white/5">
                                    <td className="py-2 text-white">Rahul</td>
                                    <td className="text-gray-300">rahul@mail.com</td>
                                    <td className="text-purple-400">Admin</td>
                                </tr>

                                <tr>
                                    <td className="py-2 text-white">Simran</td>
                                    <td className="text-gray-300">simran@mail.com</td>
                                    <td className="text-emerald-400">User</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Right Section */}
                <div className="space-y-6">

                    {/* Quick Actions */}
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Quick Actions
                        </h2>

                        <div className="space-y-3">
                            <ActionBtn label="Add New User" />
                            <ActionBtn label="Add Land Listing" />
                            <ActionBtn label="Generate Report" />
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            System Status
                        </h2>

                        <StatusItem label="Server" status="Online" />
                        <StatusItem label="Database" status="Connected" />
                        <StatusItem label="API" status="Running" />
                    </div>

                </div>
            </div>

        </AdminDashboardLayout>
    );
};

/* ---------- Reusable Components ---------- */

const StatCard = ({ title, value, icon, growth }) => (
    <div className="bg-white/10 p-6 rounded-2xl border border-white/10 flex justify-between items-center">
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <h2 className="text-2xl font-bold text-white">{value}</h2>

            <div className="flex items-center text-emerald-400 text-sm mt-1">
                <FaArrowUp className="mr-1" />
                {growth}
            </div>
        </div>

        <div className="text-3xl text-emerald-400">
            {icon}
        </div>
    </div>
);

const ActionBtn = ({ label }) => (
    <button className="w-full text-left px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition">
        {label}
    </button>
);

const StatusItem = ({ label, status }) => (
    <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-emerald-400">{status}</span>
    </div>
);

export default AdminDashboard;